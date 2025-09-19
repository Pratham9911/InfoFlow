'use client';

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Use the globally provided Firebase configuration and auth token
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : null);
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const DEPARTMENTS = ["All", "Cleaning", "Electrical", "Maintenance", "Security"];
const REPORTABLE_DEPARTMENTS = DEPARTMENTS.slice(1); // Exclude "All" for reporting

// Initialize Firebase services
let app;
let db;
let auth;
let storage;

try {
  if (firebaseConfig) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } else {
    console.error("Firebase config is not available.");
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}

// Custom UI Components
// Note: In a single-file app, we define components directly.
const Button = ({ children, className, ...props }) => (
  <button
    className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Input = ({ className, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h2 className="text-xl font-bold text-gray-800">{children}</h2>
);

const CardDescription = ({ children }) => (
  <p className="text-sm text-gray-500">{children}</p>
);

const CardContent = ({ children }) => (
  <div>{children}</div>
);

// A custom modal component to display messages
const Modal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-transform duration-300 scale-95 animate-fade-in-up">
        <p className="text-gray-700 mb-4">{message}</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

// A reusable card component to display each issue
const IssueCard = ({ issue }) => {
  return (
    <Card className="flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
      <div className="flex-shrink-0">
        <img
          src={issue.imageUrl}
          alt="Issue"
          className="w-full h-48 md:h-28 object-cover rounded-lg"
        />
      </div>
      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {issue.department}
          </span>
          <span className="text-sm text-gray-500">{issue.timestamp}</span>
        </div>
        <p className="text-lg font-medium text-gray-800">{issue.description}</p>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            issue.status === "Open" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
          }`}
        >
          {issue.status}
        </span>
      </div>
    </Card>
  );
};

export default function App() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(REPORTABLE_DEPARTMENTS[0]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [userId, setUserId] = useState(null);

  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [error, setError] = useState(null);
  const [currentDepartment, setCurrentDepartment] = useState("All");

  // Function to show modal with a message
  const showModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  useEffect(() => {
    const authenticate = async () => {
      try {
        if (initialAuthToken && auth) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else if (auth) {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication failed:", error);
      }
    };
    authenticate();

    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          setUserId(user.uid);
        } else {
          setUserId(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (userId && db) {
      const issuesCollectionRef = collection(db, "artifacts", appId, "users", userId, "issues");
      let q;

      if (currentDepartment === "All") {
        q = query(issuesCollectionRef);
      } else {
        q = query(issuesCollectionRef, where("department", "==", currentDepartment));
      }

      setLoadingIssues(true);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedIssues = [];
        querySnapshot.forEach((doc) => {
          fetchedIssues.push({
            id: doc.id,
            ...doc.data(),
            // Convert timestamp to a readable string if it exists
            timestamp: doc.data().timestamp?.toDate().toLocaleString(),
          });
        });
        
        // Client-side sorting by timestamp in descending order
        fetchedIssues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setIssues(fetchedIssues);
        setLoadingIssues(false);
      }, (err) => {
        console.error("Failed to fetch issues:", err);
        setError("Failed to load issues. Please try again.");
        setLoadingIssues(false);
      });

      return () => unsubscribe();
    }
  }, [userId, currentDepartment]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!image || !description || !selectedDepartment) {
      showModal("Please select an image, a department, and enter a description.");
      return;
    }

    if (!userId) {
        showModal("User not authenticated. Please try again.");
        return;
    }

    setUploading(true);
    setUploadMessage("Reporting issue...");

    try {
      // 1. Upload image to Firebase Storage
      const storageRef = ref(storage, `issues/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // 2. Store the issue metadata in Firestore with the selected department
      await addDoc(collection(db, "artifacts", appId, "users", userId, "issues"), {
        imageUrl,
        description,
        department: selectedDepartment,
        status: "Open",
        timestamp: serverTimestamp(),
      });
      
      showModal("Issue reported successfully!");
      setImage(null);
      setDescription("");

    } catch (error) {
      console.error("Error uploading issue:", error);
      showModal("Failed to report issue. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    setCurrentDepartment(e.target.value);
    setIssues([]); 
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen bg-gray-100">
      {isModalOpen && <Modal message={modalMessage} onClose={closeModal} />}
      
      {/* Upload Form Section */}
      <div className="md:w-1/3 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Report a New Issue</CardTitle>
            <CardDescription>Upload an image, select a department, and provide a description.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-image">Upload Image</Label>
                <Input
                  id="issue-image"
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-description">Description</Label>
                <Textarea
                  id="issue-description"
                  placeholder="e.g., 'Garbage pile in the corner of platform 1.' or 'Exposed wiring near the ticketing counter.'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issue-department">Department</Label>
                <select
                  id="issue-department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {REPORTABLE_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? uploadMessage : "Report Issue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Issues Table Section */}
      <div className="md:w-2/3 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Open Issues</CardTitle>
              <CardDescription>Track reported issues across different departments.</CardDescription>
            </div>
            <select
              value={currentDepartment}
              onChange={handleDepartmentChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
             {userId && (
              <p className="text-center text-sm text-gray-600 mb-4">
                User ID: <span className="font-mono text-gray-800 break-all">{userId}</span>
              </p>
            )}
            {loadingIssues && issues.length === 0 ? (
              <div className="text-center p-8">Loading issues...</div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">Error: {error}</div>
            ) : issues.length === 0 ? (
              <div className="text-center p-8 text-gray-500">No issues found for this department.</div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
