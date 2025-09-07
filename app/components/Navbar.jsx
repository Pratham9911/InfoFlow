// components/Navbar.jsx
'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function Navbar({ user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="w-full bg-white border-b shadow-sm flex items-center justify-between px-4 py-3">
      {/* Left section: avatar (mobile) + org name + dept · designation */}
      <div className="flex items-center gap-3">
        {/* Mobile avatar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
        >
          {initials}
        </button>

        {/* Organization + department · designation */}
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 text-xl">
            Kochi Metro Rail Limited
          </span>
          <span className="text-sm text-gray-600 mt-1">
            {user?.department || 'Department'} · {user?.designation || 'Designation'}
          </span>
        </div>
      </div>

      {/* Sidebar overlay (mobile only) */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity sm:hidden ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar slide-in (mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform sm:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar active="dashboard" user={user} />
      </div>
    </header>
  );
}
