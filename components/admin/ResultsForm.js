import React, { useState } from 'react';
import Select from 'react-select';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Import your matches and squads data:
import { matches } from '@/components/dashboard/PredictionsSection';
import { squads, teamFlags } from '@/components/dashboard/MatchCard';

export default function ResultsForm() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [actualResult, setActualResult] = useState(null);
  const [actualMOTM, setActualMOTM] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  // Build match options from your matches array
  const matchOptions = matches.map((match) => ({
    value: match.id,
    label: `${match.team1.name} vs ${match.team2.name} - ${match.matchday}`,
    ...match,
  }));

  // Generate MOTM options from squads data for the selected match
  const getMOTMOptions = () => {
    if (!selectedMatch) return [];
    const team1Squad = squads[selectedMatch.team1.name] || [];
    const team2Squad = squads[selectedMatch.team2.name] || [];
    const options = [
      ...team1Squad.map((player) => ({
        value: player.id,
        label: `${teamFlags[selectedMatch.team1.name]} ${player.name}`,
      })),
      ...team2Squad.map((player) => ({
        value: player.id,
        label: `${teamFlags[selectedMatch.team2.name]} ${player.name}`,
      })),
    ];
    return options;
  };

  // This function processes all predictions for the selected match.
  // For each prediction, it awards 50 points for a correct match result
  // and 100 points for a correct MOTM.
  const handlePushUpdate = async () => {
    if (!selectedMatch || !actualResult || !actualMOTM) {
      alert('Please select a match, result, and MOTM.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const predsRef = collection(db, 'predictions');
      const q = query(predsRef, where('matchId', '==', selectedMatch.id));
      const snapshot = await getDocs(q);
      const totalPredictions = snapshot.size;
      let processed = 0;
      const updatePromises = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let pointsToAdd = 0;
        if (data.result === actualResult) {
          pointsToAdd += 50;
        }
        // Assumes that data.manOfTheMatch is stored as an object with a `value` property.
        if (data.manOfTheMatch && data.manOfTheMatch.value === actualMOTM.value) {
          pointsToAdd += 100;
        }
        if (pointsToAdd > 0) {
          const userRef = doc(db, 'users', data.userId);
          updatePromises.push(
            updateDoc(userRef, {
              points: increment(pointsToAdd),
            })
          );
        }
        processed++;
        setProgress(Math.round((processed / totalPredictions) * 100));
      });
      await Promise.all(updatePromises);
      setMessage('Update complete!');
    } catch (error) {
      console.error('Error updating predictions:', error);
      setMessage('Error occurred during update.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Update Match Results</h2>
      <div className="mb-4">
        <label className="block mb-1">Select Match</label>
        <Select
          options={matchOptions}
          onChange={(option) => {
            setSelectedMatch(option);
            setActualResult(null);
            setActualMOTM(null);
          }}
          placeholder="Select a match..."
        />
      </div>
      {selectedMatch && (
        <>
          <div className="mb-4">
            <label className="block mb-1">Actual Result</label>
            <Select
              options={[
                { value: selectedMatch.team1.name, label: selectedMatch.team1.name },
                { value: selectedMatch.team2.name, label: selectedMatch.team2.name },
              ]}
              onChange={(option) => setActualResult(option.value)}
              placeholder="Select winning team..."
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Actual Man of the Match</label>
            <Select
              options={getMOTMOptions()}
              onChange={(option) => setActualMOTM(option)}
              placeholder="Select MOTM..."
            />
          </div>
          <button
            onClick={handlePushUpdate}
            disabled={loading}
            className="w-full py-3 bg-[#00FF87] text-[#37003C] rounded-lg hover:bg-[#00FF87]/80 transition-colors"
          >
            {loading ? 'Updating...' : 'Push Update'}
          </button>
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#00FF87] h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2">{progress}%</p>
            </div>
          )}
          {message && <p className="mt-4 text-center">{message}</p>}
        </>
      )}
    </div>
  );
}
