'use client';

import React from 'react';

// The entire application is contained within this single App component.
export default function DashboardAnalytics() {
  
  const DashboardContent = () => {
    return (
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">Total PDFs Processed</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">~15</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">Processed Today</p>
            <p className="text-4xl font-bold text-green-600 mt-2">2</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">Outstanding</p>
            <p className="text-4xl font-bold text-red-600 mt-2">1</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">Compliance Alerts</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-700">User X uploaded a new document.</span>
              <span className="text-sm text-gray-500">5 min ago</span>
            </li>
            <li className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-700">Document 'Onboarding Checklist' processed.</span>
              <span className="text-sm text-gray-500">1 hr ago</span>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-gray-700">Initial batch of 10 PDFs processed.</span>
              <span className="text-sm text-gray-500">10 days ago</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50">
      
      <main className="flex-1 overflow-y-auto p-6">
        <DashboardContent />
      </main>
    </div>
  );
}