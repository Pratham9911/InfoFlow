"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useDropzone } from "react-dropzone";
 // or your icon

export default function PdfUploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing...");
  const [summary, setSummary] = useState(null);
  const [typedSummary, setTypedSummary] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sending, setSending] = useState(false);
const UploadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12"
    />
  </svg>
);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
  });

  const handleDeptChange = (e) => {
    const value = e.target.value;
    setDepartments(prev =>
      prev.includes(value) ? prev.filter(d => d !== value) : [...prev, value]
    );
  };

  const generateSummary = async () => {
    if (!file) return alert("Please select a file.");
    setLoading(true);
    setSummary(null);
    setTypedSummary([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload-pdf/", {
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
      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      let targetDepts = [...departments];
      if (targetDepts.includes("All")) targetDepts = ["Engineering", "Operations", "HR"];

      for (let dept of targetDepts) {
        const gitResponse = await fetch("http://localhost:3000/api/uploadToGitHub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileBuffer: fileBuffer.toString("base64"),
            dept: dept,
          }),
        });
        const data = await gitResponse.json();
        if (!gitResponse.ok) throw new Error(data.error || "Upload failed");

        await addDoc(collection(db, "departments", dept, "pdfs"), {
          title: summary?.title || file.name,
          pdfLink: data.url,
          summary: summary?.bullets || "",
          uploadedAt: serverTimestamp(),
        });
      }
      alert("🎉 PDF sent successfully!");
    } catch (err) {
      alert("Send failed: " + err.message);
      console.error(err);
    } finally {
      setSending(false);
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
    <div className="max-w-4xl mx-auto space-y-6 py-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
        <p className="text-gray-500">
          Drag & drop PDFs or click to browse. Generate summaries and send to departments.
        </p>
      </div>

      {/* Drag & Drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-16 text-center transition-all duration-300 cursor-pointer ${
          isDragActive ? "border-blue-600 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full">
            <UploadIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold">
            {isDragActive ? "Drop PDF here..." : "Drag & drop your PDF"}
          </h3>
          <p className="text-gray-500">or click to select file • Up to 10MB</p>
        </div>
      </div>

      {/* Uploaded file info */}
      {file && (
        <div className="bg-gray-50 p-6 rounded-lg shadow space-y-4">
          <p>
            <strong>Selected File:</strong> {file.name}
          </p>

          {/* Department multi-select */}
          <div>
            <label className="block mb-2 font-medium">Select Departments</label>
            <div className="flex gap-3 flex-wrap">
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

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
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
          </div>

          {/* Loading / Sending */}
          {loading && (
            <p className="text-gray-700 mt-2 font-medium">{loadingMessage}</p>
          )}
          {sending && (
            <p className="text-gray-700 mt-2 font-medium">Sending...</p>
          )}
        </div>
      )}

      {/* Typed Summary */}
      {typedSummary.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow max-h-96 overflow-y-auto space-y-2">
          {typedSummary.map((line, idx) => (
            <p key={idx} className="whitespace-pre-wrap text-gray-900">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
