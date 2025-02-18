'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/authStore';
import Navbar from '@/components/shared/Navbar';
import AuthGuard from '@/components/shared/AuthGuard';
import { motion } from 'framer-motion';
import PredictionsSection from '@/components/dashboard/PredictionsSection';
import LeaguesSection from '@/components/dashboard/LeaguesSection';
import { collection, doc, getDoc, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Extended mapping for cricket-playing nations
function getCountryFlag(country) {
  const mapping = {
    'United States': '🇺🇸',
    'Pakistan': '🇵🇰',
    'India': '🇮🇳',
    'United Kingdom': '🇬🇧',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
    'Bangladesh': '🇧🇩',
    'Sri Lanka': '🇱🇰',
    'West Indies': '🏝️',
    'Zimbabwe': '🇿🇼',
    'New Zealand': '🇳🇿',
    'Ireland': '🇮🇪',
    'Afghanistan': '🇦🇫',
    'South Africa': '🇿🇦',
    'Netherlands': '🇳🇱',
    'Scotland': '🏴',
    'Nepal': '🇳🇵',
    'UAE': '🇦🇪',
  };
  return mapping[country] || '🏳️';
}

// Improved SummaryCard Component with better content containment
function SummaryCard() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState(user);
  const [overallRank, setOverallRank] = useState(null);
  const [countryRank, setCountryRank] = useState(null);
  const [loadingRank, setLoadingRank] = useState(true);

  // Fetch full user document to obtain teamName, name, points, country, etc.
  useEffect(() => {
    async function fetchUserData() {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserData({ uid: user.uid, ...docSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    }
    fetchUserData();
  }, [user]);

  // Compute overall and country ranks (using similar logic as in LeaguesSection.js)
  useEffect(() => {
    async function fetchRanks() {
      if (!user?.uid) return;
      try {
        const usersRef = collection(db, 'users');
        // Overall rank:
        const overallQuery = query(usersRef, orderBy('points', 'desc'));
        const overallSnap = await getDocs(overallQuery);
        let rank = 0;
        let myOverallRank = null;
        overallSnap.forEach((doc) => {
          rank++;
          if (doc.id === user.uid) {
            myOverallRank = rank;
          }
        });
        // Country rank:
        let myCountryRank = null;
        if (userData && userData.country) {
          const countryQuery = query(
            usersRef,
            where('country', '==', userData.country),
            orderBy('points', 'desc')
          );
          const countrySnap = await getDocs(countryQuery);
          rank = 0;
          countrySnap.forEach((doc) => {
            rank++;
            if (doc.id === user.uid) {
              myCountryRank = rank;
            }
          });
        }
        setOverallRank(myOverallRank);
        setCountryRank(myCountryRank);
      } catch (error) {
        console.error('Error fetching ranks:', error);
      } finally {
        setLoadingRank(false);
      }
    }
    fetchRanks();
  }, [user, userData]);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 mx-auto"
      style={{ width: '240px', height: '340px' }}
    >
      {/* FIFA Card Shape with Gradient Background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" 
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 90%, 85% 100%, 0 100%)',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)'
        }}>
      </div>

      <div className="relative h-full z-10 flex flex-col items-center p-4">
        {/* Top Section - Country Flag */}
        <div className="mt-4 mb-2">
          {userData?.country ? (
            <span className="text-3xl">{getCountryFlag(userData.country)}</span>
          ) : (
            <span className="text-3xl">🏳️</span>
          )}
        </div>
        
        {/* Content Section - Maintain fixed width to prevent overflow */}
        <div className="w-full flex flex-col items-center">
          {/* Team Name - Big Bold with width constraint */}
          <h2 className="text-xl font-bold text-gray-900 text-center truncate w-full px-2 mb-1">
            {userData?.teamName || 'Team Name'}
          </h2>
          
          {/* User Name with width constraint */}
          <p className="text-sm text-gray-800 truncate w-full text-center px-2 mb-4">
            {userData?.name || 'Player Name'}
          </p>
        </div>
        
        {/* Points - XXL in Center with proper sizing */}
        <div className="flex flex-col items-center justify-center flex-grow">
          <p className="text-5xl font-black text-gray-900 leading-none">
            {userData?.points || 0}
          </p>
          <p className="text-xs text-gray-800 mt-1">POINTS</p>
        </div>
        
        {/* Ranks Section - Fixed at bottom with proper spacing */}
        <div className="w-full mt-auto mb-6">
          <div className="flex justify-around w-full">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {loadingRank ? '-' : overallRank || 'N/A'}
              </p>
              <p className="text-xs text-gray-800">Overall</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {loadingRank ? '-' : countryRank || 'N/A'}
              </p>
              <p className="text-xs text-gray-800">Country</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('predictions');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#00F2FF] via-[#8000FF] to-[#87FF00] pb-20 overflow-hidden">
        {/* Reduced top gap */}
        <div className="pt-12"></div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
          <SummaryCard />
          {activeTab === 'predictions' ? <PredictionsSection /> : <LeaguesSection />}
        </main>
        {/* Bottom Navbar with a dark semi-transparent background */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#37003C] border-t border-gray-700 z-30">
          <div className="max-w-7xl mx-auto flex">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`flex-1 py-3 text-center font-bold transition-colors duration-200 ${
                activeTab === 'predictions'
                  ? 'text-[#00FF87]'
                  : 'text-white hover:text-[#00FF87]'
              }`}
            >
              Predictions
            </button>
            <button
              onClick={() => setActiveTab('leagues')}
              className={`flex-1 py-3 text-center font-bold transition-colors duration-200 ${
                activeTab === 'leagues'
                  ? 'text-[#00FF87]'
                  : 'text-white hover:text-[#00FF87]'
              }`}
            >
              Leagues
            </button>
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}