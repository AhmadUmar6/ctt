'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/authStore';
import Navbar from '@/components/shared/Navbar';
import ResultsForm from '@/components/admin/ResultsForm';
import AuthGuard from '@/components/shared/AuthGuard';

export default function AdminPage() {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Fetch admin password from environment variable
  useEffect(() => {
    // Access the environment variable through Next.js public runtime config
    // This requires you to set up the variable in your next.config.js
    setAdminPassword(process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!user) return <AuthGuard />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-md mx-auto pt-20 px-4">
          <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col">
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded mb-4"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00FF87] text-[#37003C] rounded font-bold"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Panel</h1>
        <ResultsForm />
      </div>
    </div>
  );
}