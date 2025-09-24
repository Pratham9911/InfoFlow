'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// The entire application is contained within this single App component.
export default function App() {
  // --- Component Definitions (nested for single-file structure) ---

 

  // This component is dedicated to rendering the HR analytics dashboard content.
  const HRAnalyticsContent = () => {
    // Mock data for a new company, created 10 days ago
    const headcountData = [
      { date: 'Day 1', count: 5 },
      { date: 'Day 3', count: 8 },
      { date: 'Day 5', count: 12 },
      { date: 'Day 7', count: 15 },
      { date: 'Day 10', count: 18 },
    ];

    const genderDiversityData = [
      { name: 'Male', value: 12 },
      { name: 'Female', value: 6 },
    ];
    const genderColors = ['#2563eb', '#60a5fa'];

    const sourceOfHireData = [
      { name: 'Referral', value: 4 },
      { name: 'Job Board', value: 8 },
      { name: 'Website', value: 6 },
    ];
    const sourceColors = ['#1d4ed8', '#3b82f6', '#60a5fa'];

    return (
      <div className="min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">TOTAL HEADCOUNT</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">18</p>
            <p className="text-sm text-green-500">▲ vs. last week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">VOLUNTARY TURNOVER RATE</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">0%</p>
            <p className="text-sm text-gray-500">New company</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-500">AVERAGE TENURE</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">~10</p>
            <p className="text-sm text-gray-500">DAYS</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">GENDER DIVERSITY</h2>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderDiversityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                  >
                    {genderDiversityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={genderColors[index % genderColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">SOURCE OF HIRE</h2>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceOfHireData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                  >
                    {sourceOfHireData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">HEADCOUNT TREND (LAST 10 DAYS)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={headcountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">RECRUITMENT & ONBOARDING</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-4xl text-blue-500">45%</span>
                <p className="text-sm">GENDER DIVERSITY <br/> (Hiring)</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-4xl text-blue-500">92%</span>
                <p className="text-sm">AVERAGE TIME <br/> COMPLETION RATE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => {
    return (
      <footer className="bg-white p-4 shadow-inner text-center text-gray-500 text-sm mt-auto">
        KMRL Portal - Designed by InfoFlow © 2025
      </footer>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <div className="flex-1 flex flex-col">
       
        <main className="flex-1 overflow-y-auto p-6">
          <HRAnalyticsContent />
        </main>
        <Footer />
      </div>
    </div>
  );
}
