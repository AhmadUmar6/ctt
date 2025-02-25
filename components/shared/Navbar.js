'use client';
import Link from 'next/link';
import useAuthStore from '@/lib/authStore';
import { FiLogOut } from 'react-icons/fi';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Update import to useRouter from next/navigation

export default function Navbar() {
  const { user, loading } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) return null;

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 bg-[#37003C] border-b border-gray-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Increased height */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group no-underline">
              <span className="text-3xl md:text-3xl font-bold text-white">
                CT Predictor
              </span>
            </Link>
            {user && (
              <Link href="/bracket" className="flex items-center space-x-2 text-white no-underline">
                <span>Bracket<span role="img" aria-label="fire">🔥</span></span>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFC107, #FF8C00)'; // Slight color change on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
                }}
              >
                <FiLogOut className="w-5 h-5 text-black" />
                <span className="hidden md:block text-black">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}