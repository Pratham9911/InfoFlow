"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";

const NOTICES_PER_PAGE = 10;
const DEPARTMENTS = ["Operations", "HR", "Engineering", "Legal"];

export default function NoticeTable() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentDepartment, setCurrentDepartment] = useState("Operations");
  // Updated state to hold the entire selected notice object
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotices = async (isNewQuery = false) => {
    setLoading(true);
    setError(null);
    try {
      let q;
      if (isNewQuery) {
        q = query(
          collection(db, "departments", currentDepartment, "pdfs"),
          orderBy(sortBy, sortOrder),
          limit(NOTICES_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, "departments", currentDepartment, "pdfs"),
          orderBy(sortBy, sortOrder),
          startAfter(lastVisible),
          limit(NOTICES_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedNotices = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt?.toDate().toLocaleString(),
      }));

      setNotices((prevNotices) => isNewQuery ? fetchedNotices : [...prevNotices, ...fetchedNotices]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === NOTICES_PER_PAGE);
    } catch (err) {
      console.error("Failed to fetch notices:", err);
      setError("Failed to load notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(true);
  }, [currentDepartment, sortBy, sortOrder]);

  const handleSort = (field) => {
    const newSortOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newSortOrder);
  };

  const handleDepartmentChange = (e) => {
    setCurrentDepartment(e.target.value);
    setNotices([]); // Clear previous notices to show loading state
    setLastVisible(null);
  };
  
  // Updated function to handle displaying the summary in a modal
  const handleViewSummary = (notice) => {
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotice(null);
  };

  if (loading && notices.length === 0) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Railway Notice Management</h2>
                <select className="px-3 py-2 border rounded-lg">
                    <option>Loading...</option>
                </select>
            </div>
            <p className="text-center p-8">Loading notices...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Railway Notice Management</h2>
            <p className="text-center p-8 text-red-500">Error: {error}</p>
        </div>
    );
  }

  return (
    <div className="bg-white mt-2 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Railway Notice Management</h2>
        <div className="flex items-center space-x-2">
            <label htmlFor="department-select" className="text-sm font-medium text-gray-600">Department:</label>
            <select
                id="department-select"
                value={currentDepartment}
                onChange={handleDepartmentChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                ))}
            </select>
        </div>
      </div>
      <p className="text-gray-500 mb-6">Manage and distribute railway department notices</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border-collapse rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr className="text-left">
              <th className="p-3 cursor-pointer" onClick={() => handleSort("title")}>
                Notice {sortBy === "title" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-3 cursor-pointer" onClick={() => handleSort("uploadedAt")}>
                Date {sortBy === "uploadedAt" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="p-3">Recipients</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.length > 0 ? (
              notices.map((notice) => (
                <tr key={notice.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{notice.title}</div>
                    {/* Render summary: if it's an array, join it with newlines. If a string, show it. */}
                    <div className="text-sm text-gray-500 truncate w-48">
                      {Array.isArray(notice.summary) ? notice.summary.join(' ') : notice.summary}
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{notice.uploadedAt}</td>
                  <td className="p-3 text-gray-700">125</td>
                  <td className="p-3 flex space-x-2">
                    {/* New "View Summary" button */}
                    <button 
                      onClick={() => handleViewSummary(notice)} 
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      View Summary
                    </button>
                    <button 
                      onClick={() => window.open(notice.pdfLink, "_blank")} 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">No notices found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal to display the summary */}
      {isModalOpen && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-transform duration-300 ease-in-out scale-95 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              {/* Dynamically display the PDF title */}
              <h3 className="text-xl font-semibold text-gray-800">{selectedNotice.title} Summary</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* The summary text is now dynamically rendered */}
            <p className="text-gray-700 whitespace-pre-line">
              {Array.isArray(selectedNotice.summary) 
                ? selectedNotice.summary.map((line, index) => <span key={index}>{line}<br /></span>)
                : selectedNotice.summary
              }
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        {hasMore && (
          <button 
            onClick={() => fetchNotices(false)} 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Loading more..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
}