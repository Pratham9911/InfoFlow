'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import EmployeeWidgets from '@/app/components/EmployeeWidgets';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PdfSummaryUpload from '../components/PdfSummaryUpload';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login'); // Redirect if not logged in
        return;
      }

      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUserData({ uid: user.uid, ...snap.data() });
        } else {
          console.error('User document not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    // While unlikely, this prevents rendering if userData is still null
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop only) */}
      <div className="hidden sm:flex">
        <Sidebar active="dashboard" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Navbar user={userData} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Only EmployeeWidgets for now */}
          <PdfSummaryUpload />
          <EmployeeWidgets />
        </main>
      </div>
    </div>
  );
}
