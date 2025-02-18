'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '@/lib/authStore';
import Navbar from '@/components/shared/Navbar';
import AuthGuard from '@/components/shared/AuthGuard';
import { motion, AnimatePresence } from 'framer-motion';
import PredictionsSection from '@/components/dashboard/PredictionsSection';
import LeaguesSection from '@/components/dashboard/LeaguesSection';
import { collection, doc, getDoc, setDoc, query, orderBy, where, getDocs } from 'firebase/firestore';
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

// First-time User Onboarding Modal
function OnboardingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to CT Predictor!",
      content: "Make predictions for Champions Trophy matches and compete with friends worldwide.",
      icon: "🏏"
    },
    {
      title: "How to Score Points",
      content: "Earn 50 points for correct match result predictions and 100 points for correct MOTM predictions.",
      icon: "🎯"
    },
    {
      title: "Create & Join Leagues",
      content: "Create your own leagues and invite friends to compete in private leaderboards.",
      icon: "🏆"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-white rounded-xl overflow-hidden max-w-md w-full shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #37003C, #6900a5)',
        }}
      >
        {/* Progress bar */}
        <div className="bg-white bg-opacity-10 h-1 w-full">
          <div 
            className="h-full bg-[#00FF87] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="p-6">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <span className="text-4xl">{steps[currentStep].icon}</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-white text-opacity-80 text-center mb-8">
            {steps[currentStep].content}
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-[#00FF87] text-[#37003C] font-bold rounded-full hover:bg-opacity-90 transition"
            >
              {currentStep < steps.length - 1 ? "Next" : "Get Started!"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
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
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user is first time visitor
  useEffect(() => {
    async function checkFirstTimeVisit() {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.hasSeenOnboarding !== true) {
              setShowOnboarding(true);
              // Update user document to mark onboarding as seen
              await setDoc(userDocRef, { hasSeenOnboarding: true }, { merge: true });
            }
          }
        } catch (error) {
          console.error('Error checking first time visit:', error);
        }
      }
    }
    checkFirstTimeVisit();
  }, [user]);

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
        
        {/* Onboarding Modal */}
        <AnimatePresence>
          {showOnboarding && (
            <OnboardingModal 
              isOpen={showOnboarding} 
              onClose={() => setShowOnboarding(false)} 
            />
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}