'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Select from 'react-select';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuthStore from '@/lib/authStore';

// Complete squads for all teams
export const squads = {
  India: [
    { id: 'ind1', name: 'Rohit Sharma' },
    { id: 'ind2', name: 'Shubman Gill' },
    { id: 'ind3', name: 'Virat Kohli' },
    { id: 'ind4', name: 'Shreyas Iyer' },
    { id: 'ind5', name: 'KL Rahul' },
    { id: 'ind6', name: 'Rishabh Pant' },
    { id: 'ind7', name: 'Hardik Pandya' },
    { id: 'ind8', name: 'Axar Patel' },
    { id: 'ind9', name: 'Washington Sundar' },
    { id: 'ind10', name: 'Kuldeep Yadav' },
    { id: 'ind11', name: 'Harshit Rana' },
    { id: 'ind12', name: 'Mohd. Shami' },
    { id: 'ind13', name: 'Arshdeep Singh' },
    { id: 'ind14', name: 'Ravindra Jadeja' },
    { id: 'ind15', name: 'Varun Chakaravarthy' },
  ],
  Pakistan: [
    { id: 'pak1', name: 'Mohammad Rizwan' },
    { id: 'pak2', name: 'Babar Azam' },
    { id: 'pak3', name: 'Fakhar Zaman' },
    { id: 'pak4', name: 'Kamran Ghulam' },
    { id: 'pak5', name: 'Saud Shakeel' },
    { id: 'pak6', name: 'Tayyab Tahir' },
    { id: 'pak7', name: 'Faheem Ashraf' },
    { id: 'pak8', name: 'Khushdil Shah' },
    { id: 'pak9', name: 'Salman Ali Agha' },
    { id: 'pak10', name: 'Usman Khan' },
    { id: 'pak11', name: 'Abrar Ahmed' },
    { id: 'pak12', name: 'Haris Rauf' },
    { id: 'pak13', name: 'Mohammad Hasnain' },
    { id: 'pak14', name: 'Naseem Shah' },
    { id: 'pak15', name: 'Shaheen Shah Afridi' },
  ],
  Australia: [
    { id: 'aus1', name: 'Steve Smith' },
    { id: 'aus2', name: 'Sean Abbott' },
    { id: 'aus3', name: 'Alex Carey' },
    { id: 'aus4', name: 'Ben Dwarshuis' },
    { id: 'aus5', name: 'Nathan Ellis' },
    { id: 'aus6', name: 'Jake Fraser-McGurk' },
    { id: 'aus7', name: 'Aaron Hardie' },
    { id: 'aus8', name: 'Travis Head' },
    { id: 'aus9', name: 'Josh Inglis' },
    { id: 'aus10', name: 'Spencer Johnson' },
    { id: 'aus11', name: 'Marnus Labuschagne' },
    { id: 'aus12', name: 'Glenn Maxwell' },
    { id: 'aus13', name: 'Tanveer Sangha' },
    { id: 'aus14', name: 'Matthew Short' },
    { id: 'aus15', name: 'Adam Zampa' },
  ],
  'New Zealand': [
    { id: 'nz1', name: 'Mitchell Santner' },
    { id: 'nz2', name: 'Michael Bracewell' },
    { id: 'nz3', name: 'Mark Chapman' },
    { id: 'nz4', name: 'Devon Conway' },
    { id: 'nz5', name: 'Lockie Ferguson' },
    { id: 'nz6', name: 'Matt Henry' },
    { id: 'nz7', name: 'Tom Latham' },
    { id: 'nz8', name: 'Daryl Mitchell' },
    { id: 'nz9', name: 'Will O’Rourke' },
    { id: 'nz10', name: 'Glenn Phillips' },
    { id: 'nz11', name: 'Rachin Ravindra' },
    { id: 'nz12', name: 'Jacob Duffy' },
    { id: 'nz13', name: 'Nathan Smith' },
    { id: 'nz14', name: 'Kane Williamson' },
    { id: 'nz15', name: 'Will Young' },
  ],
  Bangladesh: [
    { id: 'ban1', name: 'Nazmul Hossain Shanto' },
    { id: 'ban2', name: 'Soumya Sarkar' },
    { id: 'ban3', name: 'Tanzid Hasan' },
    { id: 'ban4', name: 'Tawhid Hridoy' },
    { id: 'ban5', name: 'Mushfiqur Rahim' },
    { id: 'ban6', name: 'MD Mahmud Ullah' },
    { id: 'ban7', name: 'Jaker Ali Anik' },
    { id: 'ban8', name: 'Mehidy Hasan Miraz' },
    { id: 'ban9', name: 'Rishad Hossain' },
    { id: 'ban10', name: 'Taskin Ahmed' },
    { id: 'ban11', name: 'Mustafizur Rahman' },
    { id: 'ban12', name: 'Parvez Hossai Emon' },
    { id: 'ban13', name: 'Nasum Ahmed' },
    { id: 'ban14', name: 'Tanzim Hasan Sakib' },
    { id: 'ban15', name: 'Nahid Rana' },
  ],
  Afghanistan: [
    { id: 'afg1', name: 'Hashmatullah Shahidi' },
    { id: 'afg2', name: 'Ibrahim Zadran' },
    { id: 'afg3', name: 'Rahmanullah Gurbaz' },
    { id: 'afg4', name: 'Sediqullah Atal' },
    { id: 'afg5', name: 'Rahmat Shah' },
    { id: 'afg6', name: 'Ikram Alikhil' },
    { id: 'afg7', name: 'Gulbadin Naib' },
    { id: 'afg8', name: 'Azmatullah Omarzai' },
    { id: 'afg9', name: 'Mohammad Nabi' },
    { id: 'afg10', name: 'Rashid Khan' },
    { id: 'afg11', name: 'Nangyal Kharoti' },
    { id: 'afg12', name: 'Noor Ahmad' },
    { id: 'afg13', name: 'Fazalhaq Farooqi' },
    { id: 'afg14', name: 'Farid Malik' },
    { id: 'afg15', name: 'Naveed Zadran' },
  ],
  England: [
    { id: 'eng1', name: 'Jos Buttler' },
    { id: 'eng2', name: 'Jofra Archer' },
    { id: 'eng3', name: 'Gus Atkinson' },
    { id: 'eng4', name: 'Jacob Bethell' },
    { id: 'eng5', name: 'Harry Brook' },
    { id: 'eng6', name: 'Brydon Carse' },
    { id: 'eng7', name: 'Ben Duckett' },
    { id: 'eng8', name: 'Jamie Overton' },
    { id: 'eng9', name: 'Jamie Smith' },
    { id: 'eng10', name: 'Liam Livingstone' },
    { id: 'eng11', name: 'Adil Rashid' },
    { id: 'eng12', name: 'Joe Root' },
    { id: 'eng13', name: 'Saqib Mahmood' },
    { id: 'eng14', name: 'Phil Salt' },
    { id: 'eng15', name: 'Mark Wood' },
  ],
  'South Africa': [
    { id: 'sa1', name: 'Temba Bavuma' },
    { id: 'sa2', name: 'Tony de Zorzi' },
    { id: 'sa3', name: 'Marco Jansen' },
    { id: 'sa4', name: 'Heinrich Klaasen' },
    { id: 'sa5', name: 'Keshav Maharaj' },
    { id: 'sa6', name: 'Aiden Markram' },
    { id: 'sa7', name: 'David Miller' },
    { id: 'sa8', name: 'Wiaan Mulder' },
    { id: 'sa9', name: 'Lungi Ngidi' },
    { id: 'sa10', name: 'Kagiso Rabada' },
    { id: 'sa11', name: 'Ryan Rickelton' },
    { id: 'sa12', name: 'Tabraiz Shamsi' },
    { id: 'sa13', name: 'Tristan Stubbs' },
    { id: 'sa14', name: 'Rassie van der Dussen' },
    { id: 'sa15', name: 'Corbin Bosch' },
  ],
};

// Mapping for team flag emojis
export const teamFlags = {
  India: '🇮🇳',
  Pakistan: '🇵🇰',
  Australia: '🇦🇺',
  'New Zealand': '🇳🇿',
  Bangladesh: '🇧🇩',
  Afghanistan: '🇦🇫',
  England: '🇬🇧',
  'South Africa': '🇿🇦'
};

// Function to render form badges
const getFormBadge = (result) => {
  const upperResult = typeof result === 'string' ? result.toUpperCase() : result;
  switch (upperResult) {
    case 'W':
      return (
        <span className="inline-block w-6 h-6 bg-green-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          W
        </span>
      );
    case 'L':
      return (
        <span className="inline-block w-6 h-6 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          L
        </span>
      );
    case 'T':
      return (
        <span className="inline-block w-6 h-6 bg-yellow-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
          T
        </span>
      );
    default:
      return (
        <span className="inline-block w-6 h-6 bg-gray-400 rounded-full text-white text-xs font-bold flex items-center justify-center">
          -
        </span>
      );
  }
};

// Spinner for button feedback
const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-[#01FF86] mr-2"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="#01FF86"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="#01FF86"
      d="M4 12a8 8 0 018-8v8H4z"
    ></path>
  </svg>
);

// Helper to add a white drop shadow for teams whose logos blend with the background
const getLogoClasses = (team) => {
  return `w-16 h-16 object-contain ${
    (team?.name === 'New Zealand' || team?.name === 'England') ? 'drop-shadow-[0_1px_white]' : ''
  }`;
};

export default function MatchCard({ match }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState(0); // 0: initial view, 1: result prediction, 2: MOTM selection
  const [prediction, setPrediction] = useState({
    result: null,
    manOfTheMatch: null,
  });
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popularPreds, setPopularPreds] = useState({ team1: 0, team2: 0 });

  // Determine the user's local timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // --- PREDICTION WINDOW LOGIC (based on PKT) ---
  // Given PKT is UTC+5, we can calculate:
  // Allowed Start: Previous day 4:00 PM PKT = Previous day 11:00 AM UTC
  // Allowed End:   Match day 1:00 PM PKT = Match day 8:00 AM UTC
  const matchStartUTC = new Date(match.startTime);
  const allowedStartUTC = new Date(Date.UTC(
    matchStartUTC.getUTCFullYear(),
    matchStartUTC.getUTCMonth(),
    matchStartUTC.getUTCDate() - 1, // previous day
    11, 0, 0
  ));
  const allowedEndUTC = new Date(Date.UTC(
    matchStartUTC.getUTCFullYear(),
    matchStartUTC.getUTCMonth(),
    matchStartUTC.getUTCDate(),
    8, 0, 0
  ));

  // For display, use toLocaleString with the user's time zone.
  const displayOptions = {
    timeZone: userTimeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  const windowStartDisplay = allowedStartUTC.toLocaleString(undefined, displayOptions);
  const windowEndDisplay = allowedEndUTC.toLocaleString(undefined, displayOptions);

  const now = new Date();
  const predictionWindowActive = now >= allowedStartUTC && now <= allowedEndUTC;

  // Format match date for header (using local time)
  const formattedDate = !isNaN(matchStartUTC.getTime())
    ? format(matchStartUTC, 'PPP')
    : 'Invalid date';

  // Build player options for MOTM selection
  const team1Squad = squads[match.team1.name] || [];
  const team2Squad = squads[match.team2.name] || [];
  const playerOptions = [
    ...team1Squad.map((player) => ({
      value: player.id,
      label: `${teamFlags[match.team1.name]} ${player.name}`,
      team: 'team1',
    })),
    ...team2Squad.map((player) => ({
      value: player.id,
      label: `${teamFlags[match.team2.name]} ${player.name}`,
      team: 'team2',
    })),
  ];

  // Check if user has already made a prediction for this match.
  useEffect(() => {
    const checkExistingPrediction = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'predictions', `${user.uid}_${match.id}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrediction({
            result: data.result,
            manOfTheMatch: data.manOfTheMatch,
          });
          setIsLocked(true);
        }
      } catch (error) {
        console.error('Error checking prediction:', error);
      }
    };
    checkExistingPrediction();
  }, [user, match.id]);

  // Fetch live popular predictions (updates every hour)
  const fetchPopularPredictions = async () => {
    try {
      const predsRef = collection(db, 'predictions');
      const q = query(predsRef, where('matchId', '==', match.id));
      const snapshot = await getDocs(q);
      let team1Count = 0;
      let team2Count = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.result === match.team1.name) {
          team1Count++;
        } else if (data.result === match.team2.name) {
          team2Count++;
        }
      });
      const total = team1Count + team2Count;
      if (total > 0) {
        setPopularPreds({
          team1: Math.round((team1Count / total) * 100),
          team2: Math.round((team2Count / total) * 100),
        });
      } else {
        setPopularPreds({ team1: 0, team2: 0 });
      }
    } catch (error) {
      console.error('Error fetching popular predictions:', error);
    }
  };

  useEffect(() => {
    fetchPopularPredictions();
    const interval = setInterval(fetchPopularPredictions, 3600000);
    return () => clearInterval(interval);
  }, [match.id]);

  const handleResultSelect = (teamName) => {
    setPrediction((prev) => ({ ...prev, result: teamName }));
  };

  const handleMotmSelect = (selected) => {
    setPrediction((prev) => ({ ...prev, manOfTheMatch: selected }));
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleLockPrediction = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'predictions', `${user.uid}_${match.id}`), {
        userId: user.uid,
        matchId: match.id,
        result: prediction.result,
        manOfTheMatch: prediction.manOfTheMatch,
        timestamp: new Date(),
        league: match.league ?? null,
        matchDate: match.date || match.startTime,
      });
      setIsLocked(true);
      setStep(0);
    } catch (error) {
      console.error('Error saving prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  // When predictions are locked, let the user tap to view the allowed window.
  const handleLockedInfo = () => {
    alert(`Predictions were accepted between:\n${windowStartDisplay}\nand\n${windowEndDisplay}`);
  };

  const renderContent = () => {
    if (isLocked) {
      return (
        <div onClick={handleLockedInfo} className="space-y-4 cursor-pointer">
          <div className="flex justify-between items-center">
            <img src={match.team1?.logo} alt={match.team1?.name} className={getLogoClasses(match.team1)} />
            <div className="text-center">
              <p className="text-lg font-bold text-[#01FF86]">VS</p>
              <p className="text-sm text-white">{formattedDate}</p>
            </div>
            <img src={match.team2?.logo} alt={match.team2?.name} className={getLogoClasses(match.team2)} />
          </div>
          <div className="bg-[#37003C] rounded-lg p-4 space-y-2">
            <p className="text-[#01FF86] text-center font-medium">Your Predictions</p>
            <p className="text-white text-center">Result: {prediction.result}</p>
            <p className="text-white text-center">MOTM: {prediction.manOfTheMatch?.label}</p>
          </div>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <img src={match.team1?.logo} alt={match.team1?.name} className={getLogoClasses(match.team1)} />
              <div className="text-center">
                <p className="text-lg font-bold text-[#01FF86]">VS</p>
                <p className="text-sm text-white">{formattedDate}</p>
                <p className="text-xs text-gray-300">{match.matchday}</p>
              </div>
              <img src={match.team2?.logo} alt={match.team2?.name} className={getLogoClasses(match.team2)} />
            </div>
            <button
              onClick={() => {
                if (!predictionWindowActive) {
                  alert(`Predictions can only be made between:\n${windowStartDisplay}\nand\n${windowEndDisplay}`);
                } else {
                  handleNextStep();
                }
              }}
              className={`w-full py-3 rounded-lg transition-colors ${
                predictionWindowActive
                  ? 'bg-[#01FF86] text-[#37003C] hover:bg-[#01FF86]/80'
                  : 'bg-[#37003C] text-gray-400 cursor-not-allowed'
              }`}
            >
              Make Predictions
            </button>
            <p className="text-xs text-center text-white mt-2">
              Prediction Window: {windowStartDisplay} – {windowEndDisplay}
            </p>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#01FF86] text-center">Predict Winner</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleResultSelect(match.team1.name)}
                className={`py-4 px-2 rounded-lg transition-all flex flex-col items-center ${
                  prediction.result === match.team1.name
                    ? 'bg-[#01FF86] text-[#37003C]'
                    : 'bg-[#37003C] text-white hover:bg-[#37003C]/80'
                }`}
              >
                <span className="text-4xl mb-2">{teamFlags[match.team1.name]}</span>
                <div className="mt-2 w-full h-1 bg-[#01FF86]/30"></div>
                <span className="text-xs mt-2">(Click to select)</span>
              </button>
              <button
                onClick={() => handleResultSelect(match.team2.name)}
                className={`py-4 px-2 rounded-lg transition-all flex flex-col items-center ${
                  prediction.result === match.team2.name
                    ? 'bg-[#01FF86] text-[#37003C]'
                    : 'bg-[#37003C] text-white hover:bg-[#37003C]/80'
                }`}
              >
                <span className="text-4xl mb-2">{teamFlags[match.team2.name]}</span>
                <div className="mt-2 w-full h-1 bg-[#01FF86]/30"></div>
                <span className="text-xs mt-2">(Click to select)</span>
              </button>
            </div>
            <div className="bg-[#290038] rounded-lg p-3 mb-4">
              <p className="text-sm text-[#01FF86] mb-2">Recent Form</p>
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <p className="text-xs text-white mb-1">{match.team1.name}</p>
                  <div className="flex space-x-1">
                    {match.recentForm?.team1.map((result, idx) => (
                      <div key={`team1-${idx}`}>{getFormBadge(result)}</div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xs text-white mb-1">{match.team2.name}</p>
                  <div className="flex space-x-1">
                    {match.recentForm?.team2.map((result, idx) => (
                      <div key={`team2-${idx}`}>{getFormBadge(result)}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#37003C] rounded-lg p-3">
              <p className="text-sm text-[#01FF86] mb-2">Popular Predictions</p>
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-xs text-white">{match.team1.name}</p>
                  <p className="text-sm font-medium text-[#01FF86]">{popularPreds.team1}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-white">{match.team2.name}</p>
                  <p className="text-sm font-medium text-[#01FF86]">{popularPreds.team2}%</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#37003C] text-[#01FF86] rounded-lg hover:bg-[#37003C]/80 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!prediction.result}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  prediction.result
                    ? 'bg-[#01FF86] text-[#37003C] hover:bg-[#01FF86]/80'
                    : 'bg-[#37003C] text-gray-400 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#01FF86] text-center">Pick Man of the Match</h3>
            <Select
              options={playerOptions}
              value={prediction.manOfTheMatch}
              onChange={handleMotmSelect}
              placeholder="Search players..."
              className="text-[#37003C]"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: '#37003C',
                  borderColor: '#01FF86',
                  '&:hover': { borderColor: '#01FF86' },
                }),
                menu: (base) => ({ ...base, backgroundColor: '#37003C' }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#01FF86' : '#37003C',
                  color: state.isFocused ? '#37003C' : 'white',
                }),
                singleValue: (base) => ({ ...base, color: 'white' }),
                input: (base) => ({ ...base, color: 'white' }),
              }}
            />
            <div className="flex justify-between">
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#37003C] text-[#01FF86] rounded-lg hover:bg-[#37003C]/80 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleLockPrediction}
                disabled={!prediction.manOfTheMatch || loading}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  prediction.manOfTheMatch && !loading
                    ? 'bg-[#01FF86] text-[#37003C] hover:bg-[#01FF86]/80'
                    : 'bg-[#37003C] text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading && <Spinner />}
                {loading ? 'Saving...' : 'Lock Prediction'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#37003C] rounded-xl shadow-xl p-6">
      {renderContent()}
    </div>
  );
}
