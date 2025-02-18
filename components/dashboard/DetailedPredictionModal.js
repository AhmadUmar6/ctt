'use client';

import { useState, useEffect } from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuthStore from '@/lib/authStore';

export default function DetailedPredictionModal({ match, onClose }) {
  const { user } = useAuthStore();
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingPrediction, setExistingPrediction] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  // Check if the match is less than 60 minutes away and fetch any existing prediction
  useEffect(() => {
    const checkLock = () => {
      const now = new Date();
      const startTime = new Date(match.startTime);
      const minutesDiff = differenceInMinutes(startTime, now);
      setIsLocked(minutesDiff <= 60);
    };

    const fetchExistingPrediction = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, 'predictions', `${user.uid}_${match.id}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setExistingPrediction(data);
          
          // If there's an existing score prediction, set it
          if (data.team1Score !== undefined && data.team2Score !== undefined) {
            setTeam1Score(data.team1Score);
            setTeam2Score(data.team2Score);
            setSaved(true);
          }
        }
      } catch (error) {
        console.error('Error fetching prediction:', error);
      }
    };

    checkLock();
    fetchExistingPrediction();
    
    const interval = setInterval(checkLock, 60000);
    return () => clearInterval(interval);
  }, [match.startTime, match.id, user]);

  const handleIncrement = (team) => {
    if (isLocked || saved) return;
    if (team === 'team1') {
      setTeam1Score(prev => prev + 1);
    } else {
      setTeam2Score(prev => prev + 1);
    }
  };

  const handleDecrement = (team) => {
    if (isLocked || saved) return;
    if (team === 'team1') {
      setTeam1Score(prev => Math.max(0, prev - 1));
    } else {
      setTeam2Score(prev => Math.max(0, prev - 1));
    }
  };

  const handleSave = async () => {
    if (isLocked || !user || loading) return;
    
    setLoading(true);
    try {
      const docRef = doc(db, 'predictions', `${user.uid}_${match.id}`);
      let updatedData = {
        userId: user.uid,
        matchId: match.id,
        team1Score: team1Score,
        team2Score: team2Score,
        timestamp: new Date(),
        league: match.league ?? null, // set a fallback value if league is undefined
        matchDate: match.startTime
      };
      
      // Preserve existing prediction data if it exists
      if (existingPrediction) {
        updatedData = {
          ...existingPrediction,
          ...updatedData
        };
      }
      
      await setDoc(docRef, updatedData);
      setSaved(true);
    } catch (error) {
      console.error('Error saving prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine the result based on the scores
  const getResult = () => {
    if (existingPrediction?.result) {
      return existingPrediction.result;
    } else {
      if (team1Score > team2Score) return 'W1';
      if (team2Score > team1Score) return 'W2';
      if (team1Score === team2Score) return 'D';
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          X
        </button>
        <h2 className="text-2xl font-bold text-[#3A225D] mb-4">
          {match.team1?.name} vs {match.team2?.name}
        </h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Matchday: {match.matchday} | Start Time: {format(new Date(match.startTime), 'PPPpp')}
          </p>
          <p className="text-sm text-gray-600">
            Selected Prediction: {getResult() || 'None'}
          </p>
          <p className="text-sm text-gray-600">
            Man of the Match: {existingPrediction?.manOfTheMatch?.label || 'None'}
          </p>
        </div>
        
        {/* Recent Form */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#3A225D]">Recent Form</h3>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-sm font-medium text-[#3A225D]">{match.team1?.name}</p>
              <div className="flex space-x-1">
                {(match.recentForm?.team1 || []).map((result, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-white text-xs ${
                      result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[#3A225D]">{match.team2?.name}</p>
              <div className="flex space-x-1">
                {(match.recentForm?.team2 || []).map((result, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-white text-xs ${
                      result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  >
                    {result}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Score Selector */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#3A225D]">Set Your Score Prediction</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-sm text-[#3A225D]">{match.team1?.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecrement('team1')}
                  disabled={isLocked || saved}
                  className={`px-2 py-1 rounded ${
                    isLocked || saved 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={team1Score}
                  readOnly
                  className="w-12 text-center border rounded"
                />
                <button
                  onClick={() => handleIncrement('team1')}
                  disabled={isLocked || saved}
                  className={`px-2 py-1 rounded ${
                    isLocked || saved 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm text-[#3A225D]">{match.team2?.name}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecrement('team2')}
                  disabled={isLocked || saved}
                  className={`px-2 py-1 rounded ${
                    isLocked || saved 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={team2Score}
                  readOnly
                  className="w-12 text-center border rounded"
                />
                <button
                  onClick={() => handleIncrement('team2')}
                  disabled={isLocked || saved}
                  className={`px-2 py-1 rounded ${
                    isLocked || saved 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Predictions Breakdown */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#3A225D]">Popular Predictions Breakdown</h3>
          <div className="flex justify-around mt-2">
            <div className="text-center">
              <p className="text-sm text-gray-600">W1</p>
              <p className="text-md font-bold text-[#3A225D]">{match.popularPredictions?.W1 || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">D</p>
              <p className="text-md font-bold text-[#3A225D]">{match.popularPredictions?.D || 0}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">W2</p>
              <p className="text-md font-bold text-[#3A225D]">{match.popularPredictions?.W2 || 0}%</p>
            </div>
          </div>
        </div>
        
        {/* Save Prediction Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={isLocked || saved || loading}
            className={`px-6 py-3 rounded-lg transition-colors duration-200 font-medium ${
              isLocked || saved || loading
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-[#3A225D] text-white hover:bg-[#4A326D]'
            }`}
          >
            {loading ? 'Saving...' : saved ? 'Prediction Saved' : isLocked ? 'Prediction Locked' : 'Save Prediction'}
          </button>
        </div>
      </div>
    </div>
  );
}
