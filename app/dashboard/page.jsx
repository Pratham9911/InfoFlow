'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import EmployeeWidgets from '@/app/components/EmployeeWidgets';
import NoticeTable from '@/app/components/NoticeTable';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PdfSummaryUpload from '../components/PdfSummaryUpload';
import IssuesDashboard from '../components/IssuesDashboard';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace('/login');
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

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden sm:flex">
        <Sidebar active="dashboard" />
      </div>

      <div className="flex-1 flex flex-col">
        <Navbar user={userData} />

        <main className="flex-1 overflow-y-auto p-6">
          <PdfSummaryUpload />
          <EmployeeWidgets />
          <IssuesDashboard />
          <NoticeTable />
        </main>
      </div>
    </div>
  );
}
