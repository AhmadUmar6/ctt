'use client';
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuthStore from '@/lib/authStore';
import AuthGuard from '@/components/shared/AuthGuard';
import Navbar from '@/components/shared/Navbar';
import Loading from '@/components/shared/Loading';

const CricketBracketPredictor = ({ initialBracket, onSubmit }) => {
  // States for group, semifinal, final and champion selections.
  const [groupASelections, setGroupASelections] = useState(
    initialBracket?.groupASelections || [null, null]
  );
  const [groupBSelections, setGroupBSelections] = useState(
    initialBracket?.groupBSelections || [null, null]
  );
  const [semifinalists, setSemifinalists] = useState(
    initialBracket?.semifinalists || [null, null, null, null]
  );
  const [finalists, setFinalists] = useState(
    initialBracket?.finalists || [null, null]
  );
  const [champion, setChampion] = useState(initialBracket?.champion || null);

  // For showing validation/success messages on save.
  const [saveMessage, setSaveMessage] = useState('');
  
  // New states for loading, saved status, and popup visibility
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Track active selection paths for highlighting connections
  const [activePaths, setActivePaths] = useState({
    groupA1ToSemi1: false,
    groupB2ToSemi1: false,
    groupB1ToSemi2: false,
    groupA2ToSemi2: false,
    semi1ToFinal: false,
    semi2ToFinal: false,
    finalToChampion: false
  });

  // Update state if initial bracket loads later.
  useEffect(() => {
    if (initialBracket) {
      setGroupASelections(initialBracket.groupASelections || [null, null]);
      setGroupBSelections(initialBracket.groupBSelections || [null, null]);
      setSemifinalists(initialBracket.semifinalists || [null, null, null, null]);
      setFinalists(initialBracket.finalists || [null, null]);
      setChampion(initialBracket.champion || null);
      // Check if user already has a complete prediction
      const isComplete = initialBracket.champion && 
                        !initialBracket.groupASelections.includes(null) && 
                        !initialBracket.groupBSelections.includes(null) &&
                        !initialBracket.finalists.includes(null);
      setIsSaved(isComplete);
    }
  }, [initialBracket]);

  // Update active paths based on selections
  useEffect(() => {
    setActivePaths({
      groupA1ToSemi1: !!groupASelections[0],
      groupB2ToSemi1: !!groupBSelections[1],
      groupB1ToSemi2: !!groupBSelections[0],
      groupA2ToSemi2: !!groupASelections[1],
      semi1ToFinal: !!finalists[0],
      semi2ToFinal: !!finalists[1],
      finalToChampion: !!champion
    });
  }, [groupASelections, groupBSelections, semifinalists, finalists, champion]);

  // Reset saved state if user makes changes after saving
  useEffect(() => {
    if (isSaved) {
      setIsSaved(false);
    }
  }, [groupASelections, groupBSelections, semifinalists, finalists, champion]);

  // Auto-close popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Hard-coded team groups:
  const groupA = [
    { id: 'pak', name: 'Pakistan', logo: '🇵🇰' },
    { id: 'ind', name: 'India', logo: '🇮🇳' },
    { id: 'nz', name: 'New Zealand', logo: '🇳🇿' },
    { id: 'ban', name: 'Bangladesh', logo: '🇧🇩' },
  ];
  const groupB = [
    { id: 'sa', name: 'South Africa', logo: '🇿🇦' },
    { id: 'aus', name: 'Australia', logo: '🇦🇺' },
    { id: 'eng', name: 'England', logo: '🇬🇧' },
    { id: 'afg', name: 'Afghanistan', logo: '🇦🇫' },
  ];

  // Allow up to 2 selections per group.
  const handleGroupSelection = (team, group) => {
    let newSelections, newSemifinals;
    if (group === 'A') {
      newSelections = [...groupASelections];
      if (newSelections.some(sel => sel?.id === team.id)) {
        // Deselect if already selected.
        newSelections = newSelections.map(sel => (sel?.id === team.id ? null : sel));
      } else {
        // Add team to first empty slot.
        const emptyIndex = newSelections.findIndex(sel => sel === null);
        if (emptyIndex !== -1) {
          newSelections[emptyIndex] = team;
        }
      }
      setGroupASelections(newSelections);
      // For Group A: A1 → semifinal slot 0; A2 → semifinal slot 3.
      newSemifinals = [...semifinalists];
      newSemifinals[0] = newSelections[0];
      newSemifinals[3] = newSelections[1];
      setSemifinalists(newSemifinals);
    } else if (group === 'B') {
      newSelections = [...groupBSelections];
      if (newSelections.some(sel => sel?.id === team.id)) {
        newSelections = newSelections.map(sel => (sel?.id === team.id ? null : sel));
      } else {
        const emptyIndex = newSelections.findIndex(sel => sel === null);
        if (emptyIndex !== -1) {
          newSelections[emptyIndex] = team;
        }
      }
      setGroupBSelections(newSelections);
      // For Group B: B1 → semifinal slot 2; B2 → semifinal slot 1.
      newSemifinals = [...semifinalists];
      newSemifinals[2] = newSelections[0];
      newSemifinals[1] = newSelections[1];
      setSemifinalists(newSemifinals);
    }
    // Clear any save message when changing selections.
    setSaveMessage('');
  };

  const handleSemisSelection = (team, position) => {
    if (!team) return;
    const newFinalists = [...finalists];
    newFinalists[position] = team;
    setFinalists(newFinalists);
    if (champion && champion.id === team.id) {
      setChampion(null);
    }
    setSaveMessage('');
  };

  const handleFinalSelection = (team) => {
    if (!team) return;
    setChampion(team);
    setSaveMessage('');
  };

  // UI Component for team selection.
  const TeamSelection = ({ team, isSelected, onSelect, disabled = false, highlight = false }) => (
    <div
      className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-[#00FF87] text-[#37003C] shadow-md'
          : disabled
          ? 'bg-[#37003C] text-gray-500'
          : highlight
          ? 'bg-[#37003C] text-white border border-[#00FF87]'
          : 'bg-[#37003C] text-white hover:bg-opacity-80 hover:border-[#00FF87] border border-transparent'
      }`}
      onClick={() => !disabled && onSelect(team)}
    >
      <div className="w-8 h-8 flex items-center justify-center mr-3 text-xl">
        {team.logo}
      </div>
      <span className="font-medium">{team.name}</span>
      <div className="ml-auto">
        <div
          className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center ${
            isSelected ? 'bg-white' : ''
          }`}
        >
          {isSelected && <div className="w-4 h-4 rounded-full bg-[#37003C]"></div>}
        </div>
      </div>
    </div>
  );

  // A placeholder for empty match boxes.
  const EmptyBox = () => (
    <div className="h-14 w-full my-2 rounded-lg bg-[#37003C] bg-opacity-50 flex items-center justify-center text-gray-400">
      <div className="w-6 h-6 bg-gray-700 rounded-full mr-2"></div>
      <div className="w-16 h-4 bg-gray-700 rounded-full"></div>
    </div>
  );

  // New save handler that validates completeness before submitting.
  const handleSave = async () => {
    // Don't allow saving if already saved
    if (isSaved) return;
    
    // Check if any group, finalist or champion selection is missing.
    if (
      groupASelections.includes(null) ||
      groupBSelections.includes(null) ||
      finalists.includes(null) ||
      !champion
    ) {
      setSaveMessage("Please complete all bracket predictions before saving.");
      return;
    }
    
    // Show loading state
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      await onSubmit({
        groupASelections,
        groupBSelections,
        semifinalists,
        finalists,
        champion,
      });
      
      // Success feedback
      setIsSaved(true);
      setShowPopup(true);
      setSaveMessage("Your bracket is saved!");
    } catch (error) {
      console.error('Error saving bracket:', error);
      setSaveMessage("Error saving bracket. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Success popup component
  const SuccessPopup = () => (
    <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-white text-[#37003C] py-4 px-8 rounded-xl shadow-2xl z-50 flex items-center animate-bounce">
      <span className="text-2xl mr-3">🎉</span>
      <span className="font-bold">Prediction Saved Successfully!</span>
      <span className="text-2xl ml-3">🎊</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center p-6 bg-[#37003C] text-white rounded-xl shadow-2xl relative">
      <h1 className="text-3xl font-bold mb-8">Champions Trophy Bracket</h1>
      
      {/* Show success popup when visible */}
      {showPopup && <SuccessPopup />}
      
      <div className="w-full relative">
        {/* Three-column layout */}
        <div className="flex flex-col md:flex-row justify-between relative">
          {/* Left Column – Group Stage */}
          <div className="md:w-1/3 p-4">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-[#00FF87]/30">Group Stage</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Group A</h3>
              <div className="space-y-2">
                {groupA.map(team => (
                  <TeamSelection
                    key={team.id}
                    team={team}
                    isSelected={groupASelections.some(sel => sel?.id === team.id)}
                    onSelect={() => handleGroupSelection(team, 'A')}
                    disabled={isSaved}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-4">Group B</h3>
              <div className="space-y-2">
                {groupB.map(team => (
                  <TeamSelection
                    key={team.id}
                    team={team}
                    isSelected={groupBSelections.some(sel => sel?.id === team.id)}
                    onSelect={() => handleGroupSelection(team, 'B')}
                    disabled={isSaved}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Middle Column – Semifinals */}
          <div className="md:w-1/3 p-4">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-[#00FF87]/30">Semifinals</h2>
            
            <div className="mb-12 relative pt-4">
              <h3 className="text-xl font-medium mb-4">Semifinal 1</h3>
              <div className="space-y-4">
                {[semifinalists[0], semifinalists[1]].map((team, index) =>
                  team ? (
                    <TeamSelection
                      key={`semi1-${index}`}
                      team={team}
                      isSelected={finalists[0]?.id === team.id}
                      onSelect={() => handleSemisSelection(team, 0)}
                      highlight={
                        (index === 0 && activePaths.groupA1ToSemi1) || 
                        (index === 1 && activePaths.groupB2ToSemi1)
                      }
                      disabled={isSaved}
                    />
                  ) : (
                    <EmptyBox key={`semi1-empty-${index}`} />
                  )
                )}
              </div>
            </div>
            
            <div className="mb-6 relative pt-4">
              <h3 className="text-xl font-medium mb-4">Semifinal 2</h3>
              <div className="space-y-4">
                {[semifinalists[2], semifinalists[3]].map((team, index) =>
                  team ? (
                    <TeamSelection
                      key={`semi2-${index}`}
                      team={team}
                      isSelected={finalists[1]?.id === team.id}
                      onSelect={() => handleSemisSelection(team, 1)}
                      highlight={
                        (index === 0 && activePaths.groupB1ToSemi2) || 
                        (index === 1 && activePaths.groupA2ToSemi2)
                      }
                      disabled={isSaved}
                    />
                  ) : (
                    <EmptyBox key={`semi2-empty-${index}`} />
                  )
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column – Final & Champion */}
          <div className="md:w-1/3 p-4">
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-[#00FF87]/30">Final</h2>
            
            <div className="mb-12 pt-4">
              <div className="space-y-4">
                {[finalists[0], finalists[1]].map((team, index) =>
                  team ? (
                    <TeamSelection
                      key={`final-${index}`}
                      team={team}
                      isSelected={champion?.id === team.id}
                      onSelect={() => handleFinalSelection(team)}
                      highlight={
                        (index === 0 && activePaths.semi1ToFinal) || 
                        (index === 1 && activePaths.semi2ToFinal)
                      }
                      disabled={isSaved}
                    />
                  ) : (
                    <EmptyBox key={`final-empty-${index}`} />
                  )
                )}
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-[#00FF87]/30">Champion</h2>
              <div className="w-full max-w-xs mx-auto bg-[#00FF87] text-[#37003C] rounded-xl p-6 flex flex-col items-center border-2 border-[#37003C] shadow-lg">
                {champion ? (
                  <>
                    <div className="text-5xl mb-4">{champion.logo}</div>
                    <div className="text-2xl font-bold">{champion.name}</div>
                    <div className="mt-2 text-sm">Champions Trophy Winner</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-[#37003C] flex items-center justify-center text-4xl mb-4">
                      ?
                    </div>
                    <div className="text-lg">Make your prediction</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save button with dynamic state */}
      <button
        onClick={handleSave}
        disabled={isSaving || isSaved}
        className={`mt-10 px-8 py-4 rounded-lg transition-all duration-200 font-medium shadow-lg flex items-center justify-center ${
          isSaved
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : isSaving
            ? 'bg-yellow-400 text-[#37003C]'
            : 'bg-[#00FF87] text-[#37003C] hover:bg-[#00FF87]/90'
        }`}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#37003C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : isSaved ? (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Prediction Saved
          </>
        ) : (
          'Save Bracket Prediction'
        )}
      </button>
      {saveMessage && <p className="mt-4 text-center font-medium">{saveMessage}</p>}
    </div>
  );
};

export default function BracketPage() {
  const { user } = useAuthStore();
  const [savedBracket, setSavedBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // On mount, check Firestore for an existing bracket prediction.
  useEffect(() => {
    if (!user) return;
    const fetchBracket = async () => {
      try {
        const docRef = doc(db, 'Brackets', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSavedBracket(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching bracket:', err);
        setError('Failed to load your bracket prediction.');
      } finally {
        setLoading(false);
      }
    };
    fetchBracket();
  }, [user]);

  // Save the final bracket to Firestore.
  const handleSubmit = async (bracketData) => {
    if (!user) return;
    
    // Simulate a bit of loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      await setDoc(doc(db, 'Brackets', user.uid), bracketData);
      setSavedBracket(bracketData);
      return true;
    } catch (err) {
      console.error('Error saving bracket:', err);
      setError('Failed to save your bracket prediction. Please try again.');
      throw err;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#00F2FF] via-[#8000FF] to-[#87FF00]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8">
          <CricketBracketPredictor
            initialBracket={savedBracket}
            onSubmit={handleSubmit}
          />
          {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
        </main>
      </div>
    </AuthGuard>
  );
}