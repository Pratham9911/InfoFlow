"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp , getDocs} from "firebase/firestore";
import IssuesDashboard from '../components/IssuesDashboard';
import NoticeTable from './NoticeTable';
export default function PdfUploadModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Preparing...");
    const [summary, setSummary] = useState(null);
    const [typedSummary, setTypedSummary] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sending, setSending] = useState(false);

useEffect(() => {
    const fetchPDFs = async () => {
      const querySnapshot = await getDocs(
        collection(db, "departments", "HR", "pdfs")
      );
      querySnapshot.forEach(doc => {
        console.log("PDF metadata:", doc.data());
        console.log("File URL:", doc.data().fileUrl);
      });
    };

    fetchPDFs();
  }, []);

    const loadingMessages = [
        "Reading file...",
        "Generating summary...",
        "Identifying key points...",
        "Finalizing bullets...",
        "Almost done...",
    ];

    // Loading messages animation
    useEffect(() => {
        if (!loading) return;
        let i = 0;
        const interval = setInterval(() => {
            setLoadingMessage(loadingMessages[i % loadingMessages.length]);
            i++;
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleDeptChange = (e) => {
        const value = e.target.value;
        setDepartments(prev =>
            prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
        );
    };

    // Generate Summary only (backend)
    const generateSummary = async () => {
        if (!file) return alert("Please select a file.");
        setLoading(true);
        setSummary(null);
        setTypedSummary([]);

        const formData = new FormData();
        formData.append("file", file);


// "http://127.0.0.1:8000/upload-pdf/"
        try {
            const res = await fetch("http://127.0.0.1:8001/upload-pdf-ollama/", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setSummary(data);
        } catch (err) {
            alert("Summary generation failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };


const sendPDF = async () => {
  if (!file) return alert("Please select a file.");
  if (departments.length === 0) return alert("Select at least one department.");
  setSending(true);

  try {
    // 1️⃣ Convert file to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 2️⃣ Expand "All" into real departments
    let targetDepts = [...departments];
    if (targetDepts.includes("All")) {
      targetDepts = ["Engineering", "Operations", "HR"];
    }

    // 3️⃣ Upload for each department
    for (let dept of targetDepts) {
      try {
        const gitResponse = await fetch("http://localhost:3000/api/uploadToGitHub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileBuffer: fileBuffer.toString("base64"), // must match API route
            dept: dept,
          }),
        });

        const data = await gitResponse.json();
        if (!gitResponse.ok) throw new Error(data.error || "Upload failed");

        // 4️⃣ Save metadata in Firestore
        await addDoc(collection(db, "departments", dept, "pdfs"), {
          title: summary?.title || file.name,
          pdfLink: data.url,          // GitHub raw link
          summary: summary?.bullets || "",
          uploadedAt: serverTimestamp(),
        });

        alert(`✅ Uploaded & saved for ${dept}`);
      } catch (e) {
        alert(`❌ Failed for ${dept}: ${e.message}`);
        console.error(e);
      }
    }

    alert("🎉 PDF sent successfully!");
  } catch (err) {
    alert("Send failed: " + err.message);
    console.error(err);
  } finally {
    setSending(false);
  }
};




 


const viewPDF = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "departments", "Operations", "pdfs") // 🔥 hardcoded dept name
    );

    if (snapshot.empty) {
      alert("❌ No PDFs found in Operations");
      return;
    }

    const firstDoc = snapshot.docs[0].data();
    console.log("📄 Found PDF document:", firstDoc);

    if (firstDoc?.pdfLink) {
      window.open(firstDoc.pdfLink, "_blank");
    } else {
      alert("❌ No valid PDF link found in Firestore doc");
    }
  } catch (err) {
    alert("Failed to open PDF: " + err.message);
    console.error(err);
  }
};




    // Typed summary animation
    useEffect(() => {
        if (!summary) return;
        setTypedSummary([]);

        const bulletsArray =
            typeof summary.bullets === "string"
                ? summary.bullets.split("\n").map(line => line.trim()).filter(line => line !== "")
                : Array.isArray(summary.bullets)
                    ? summary.bullets.map(line => line.trim())
                    : [];

        const cleanBullets = bulletsArray.map(line => line.replace(/\n/g, " "));
        const text = [` ${summary.title}`, ...cleanBullets];

        let charIndex = 0;
        let lineIndex = 0;

        const interval = setInterval(() => {
            if (lineIndex >= text.length) {
                clearInterval(interval);
                return;
            }

            const currentLine = text[lineIndex];
            setTypedSummary(prev => {
                const newLines = [...prev];
                newLines[lineIndex] = (newLines[lineIndex] || "") + currentLine[charIndex];
                return newLines;
            });

            charIndex++;
            if (charIndex >= currentLine.length) {
                charIndex = 0;
                lineIndex++;
            }
        }, 20);

        return () => clearInterval(interval);
    }, [summary]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
                Upload PDF
            </button>
            <NoticeTable />
            <IssuesDashboard />
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    <div className="relative bg-white p-8 rounded-2xl w-11/12 max-w-2xl shadow-2xl z-10">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900">Upload PDF</h2>

                        {/* File input */}
                        <label className="block mb-4">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-gray-700 border border-gray-300 rounded-lg cursor-pointer file:bg-blue-600 file:text-white file:px-4 file:py-2 hover:file:bg-blue-700 transition"
                            />
                        </label>

                        {/* Department multi-select */}
                        <div className="mb-4">
                            <label className=" block mb-2 font-medium">Select Departments</label>
                            <div className="flex gap-3 text-black">
                                {["Engineering", "Operations", "HR", "All"].map(dept => (
                                    <label key={dept} className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            value={dept}
                                            checked={departments.includes(dept)}
                                            onChange={handleDeptChange}
                                        />
                                        {dept}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col md:flex-row gap-3 mt-4">
                            <button
                                onClick={generateSummary}
                                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Generate Summary
                            </button>

                            <button
                                onClick={sendPDF}
                                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Send PDF
                            </button>

                            <button
                                onClick={viewPDF}
                                className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                View PDF
                            </button>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="mt-4 flex items-center space-x-3">
                                <div className="w-6 h-6 border-1 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-800 font-medium">{loadingMessage}</p>
                            </div>
                        )}
                        {sending && (
                            <div className="mt-4 flex items-center space-x-3">
                                <div className="w-6 h-6 border-1 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-800 font-medium"> Sending...</p>
                            </div>
                        )}
                        
                        {/* Typed Summary */}
                        {typedSummary.length > 0 && (
                            <div className="mt-6 text-gray-900 space-y-2 bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                {typedSummary.map((line, idx) => (
                                    <p key={idx} className="whitespace-pre-wrap">{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
