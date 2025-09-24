// components/Sidebar.jsx
'use client';

import { useState, useEffect } from 'react';
import { Home, FileText, Bell, User , Activity } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Sidebar({ active, onChangePage }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const ref = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUser(snap.data());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUser();
  }, []);

  const initials = user?.name
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'U';

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { key: "Upload", label: "Document", icon: <FileText size={18} /> },
    { key: "Analysis", label: "Analysis", icon: <Activity size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { key: "Profile", label: "Profile", icon: <User size={18} /> },
  ];

  if (!user) {
    return (
      <aside className="h-screen w-64 bg-white border-r shadow-sm flex items-center justify-center">
        <p className="text-gray-500">Loading user...</p>
      </aside>
    );
  }

  return (
    <aside className="h-screen w-64 bg-white border-r shadow-sm flex flex-col justify-between">
      {/* Top: User Info */}
      <div>
        <div className="px-6 py-5 border-b flex flex-col items-center sm:items-start space-y-2">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">
              {user.department} · {user.designation}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 py-6 space-y-2">
          {menu.map((item) => (
            <button
              key={item.key}
              onClick={() => onChangePage(item.key)} // 🔑 add this
              className={`flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition ${active === item.key
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}

        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="px-6 py-4 border-t text-sm text-gray-500 text-center">
        InfoFlow © 2025
      </div>
    </aside>
  );
}
