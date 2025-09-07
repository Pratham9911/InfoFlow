'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [designation, setDesignation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Departments and roles for MVP
    const departments = {
        Engineering: ['Design Engineer', 'Maintenance Engineer', 'Shift Lead'],
        Operations: ['Station Controller', 'Shift Manager'],
        HR: ['HR Officer', 'Training Coordinator'],
    };

    // 🔹 Save user profile in Firestore
    const saveUserProfile = async (user) => {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                uid: user.uid,
                name: fullName,
                email: user.email,
                department,
                designation,
                role: 'employee', // only employees can register
                createdAt: new Date(),
            });
        }
    };

    // 🔹 Handle Register
    const handleRegister = async () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCred.user, { displayName: fullName });
            await saveUserProfile(userCred.user);
            setMessage('✅ Registration successful! Redirecting...');
            router.replace('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Handle Login
    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const userCred = await signInWithEmailAndPassword(auth, email, password);

            // fetch role from Firestore
            const ref = doc(db, 'users', userCred.user.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                router.replace(`/dashboard`);
            } else {
                setError('No user profile found. Contact admin.');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Forgot password
    const handleForgotPassword = async () => {
        if (!email) {
            setError('Enter your email to reset password.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent!');
        } catch (err) {
            setError('Failed to send reset email.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
            {/* Navbar / Branding */}
            <header className="flex items-center justify-between border-b px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-600 rounded-md"></div>
                    <h2 className="text-lg font-bold">InfoFlow</h2>
                </div>
            </header>

            {/* Loading spinner */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                    <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 justify-center items-center px-4 py-8">
                <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-center mb-6">
                        {activeTab === 'login' ? 'Welcome Back' : 'Create Your Account'}
                    </h2>

                    {/* Tabs */}
                    <div className="flex mb-6 border-b">
                        <button
                            onClick={() => setActiveTab('login')}
                            className={`flex-1 py-2 font-semibold border-b-2 ${activeTab === 'login' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-2 font-semibold border-b-2 ${activeTab === 'register' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error/Message */}
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

                    {/* Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            activeTab === 'login' ? handleLogin() : handleRegister();
                        }}
                        className="space-y-4"
                    >
                        {activeTab === 'register' && (
                            <>
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Department</label>
                                    <select
                                        value={department}
                                        onChange={(e) => {
                                            setDepartment(e.target.value);
                                            setDesignation(''); // reset role
                                        }}
                                        className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                        required
                                    >
                                        <option value="">Select your department</option>
                                        {Object.keys(departments).map((dept) => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Designation / Role */}
                                <div>
                                    <label className="block text-base font-medium mb-2">Designation</label>
                                    <select
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                        required
                                        disabled={!department}
                                    >
                                        <option value="">Select your role</option>
                                        {department && departments[department].map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Email / Employee ID</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email or employee ID"
                                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        {activeTab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                                    required
                                />
                            </div>
                        )}

                        {/* Forgot password */}
                        {activeTab === 'login' && (
                            <div
                                onClick={handleForgotPassword}
                                className="text-sm text-purple-600 underline cursor-pointer"
                            >
                                Forgot Password?
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg mt-2"
                        >
                            {activeTab === 'login' ? 'Login' : 'Register'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
