'use client';
import React from 'react';

export default function EmployeeWidgets() {
  return (
    <div className="space-y-6">
      {/* Recent Notices */}
      <div className="p-6 rounded-lg shadow bg-white">
        <h3 className="text-lg font-bold mb-2">Recent Notices</h3>
        <ul className="space-y-2 text-gray-700">
          <li>Quarterly Meeting on Sept 20</li>
          <li>Cybersecurity Training on Sept 12</li>
        </ul>
      </div>

      {/* Trainings / Meetings */}
      <div className="p-6 rounded-lg shadow bg-white">
        <h3 className="text-lg font-bold mb-2">Trainings & Meetings</h3>
        <p>📅 Team Meeting - 14 Sept, 3 PM</p>
      </div>

      {/* Notifications */}
      <div className="p-6 rounded-lg shadow bg-white">
        <h3 className="text-lg font-bold mb-2">Notifications</h3>
        <p>📢 Manager uploaded new training file</p>
      </div>

      {/* Personal Docs */}
      <div className="p-6 rounded-lg shadow bg-white">
        <h3 className="text-lg font-bold mb-2">Personal Documents</h3>
        <ul className="space-y-2 text-gray-700">
          <li>my_resume.pdf</li>
          <li>leave_request.docx</li>
        </ul>
      </div>
    </div>
  );
}
