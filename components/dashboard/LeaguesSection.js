'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import useAuthStore from '@/lib/authStore';

// Spinner Component
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
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    ></path>
  </svg>
);

// Utility: Map common country names to their flag emoji
const getCountryFlag = (country) => {
  const mapping = {
    'United States': '🇺🇸',
    Pakistan: '🇵🇰',
    India: '🇮🇳',
    'United Kingdom': '🇬🇧',
    Canada: '🇨🇦',
    Australia: '🇦🇺',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Italy: '🇮🇹',
    Spain: '🇪🇸',
    // add more mappings as needed
  };
  return mapping[country] || '🏳️';
};

export default function LeaguesSection() {
  const { user } = useAuthStore();
  const [currentUserData, setCurrentUserData] = useState(user);
  const [publicTab, setPublicTab] = useState('overall');

  // Public leaderboard state
  const [overallData, setOverallData] = useState({
    topUsers: [],
    totalCount: 0,
    userRank: null,
  });
  const [countryData, setCountryData] = useState({
    topUsers: [],
    totalCount: 0,
    userRank: null,
  });
  const [loadingOverall, setLoadingOverall] = useState(true);
  const [loadingCountry, setLoadingCountry] = useState(true);

  // Private leagues & modal states
  const [privateLeagues, setPrivateLeagues] = useState([]);
  const [loadingPrivate, setLoadingPrivate] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState([]);
  const [loadingFullLeaderboard, setLoadingFullLeaderboard] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPrivateLeagueModal, setShowPrivateLeagueModal] = useState(false);

  // Fetch full user document to get details like country
  useEffect(() => {
    async function fetchUserDoc() {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUserData({ uid: user.uid, ...docSnap.data() });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      }
    }
    fetchUserDoc();
  }, [user]);

  // Fetch Overall Public League Data (top 10)
  useEffect(() => {
    async function fetchOverall() {
      setLoadingOverall(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('points', 'desc'));
        const snapshot = await getDocs(q);
        const users = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...docSnap.data() });
        });
        const totalCount = users.length;
        const topUsers = users.slice(0, 10);
        let userRank = null;
        if (user?.uid) {
          userRank = users.findIndex((u) => u.id === user.uid) + 1;
        }
        setOverallData({ topUsers, totalCount, userRank });
      } catch (error) {
        console.error('Error fetching overall data:', error);
      } finally {
        setLoadingOverall(false);
      }
    }
    if (user) {
      fetchOverall();
    }
  }, [user]);

  // Fetch Country-Specific League Data (top 10)
  useEffect(() => {
    async function fetchCountry() {
      if (!currentUserData?.country) {
        setCountryData({ topUsers: [], totalCount: 0, userRank: null });
        setLoadingCountry(false);
        return;
      }
      setLoadingCountry(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('country', '==', currentUserData.country),
          orderBy('points', 'desc')
        );
        const snapshot = await getDocs(q);
        const users = [];
        snapshot.forEach((docSnap) => {
          users.push({ id: docSnap.id, ...docSnap.data() });
        });
        const totalCount = users.length;
        const topUsers = users.slice(0, 10);
        let userRank = null;
        if (user?.uid) {
          userRank = users.findIndex((u) => u.id === user.uid) + 1;
        }
        setCountryData({ topUsers, totalCount, userRank });
      } catch (error) {
        console.error('Error fetching country-specific data:', error);
      } finally {
        setLoadingCountry(false);
      }
    }
    if (currentUserData && currentUserData.country) {
      fetchCountry();
    }
  }, [currentUserData, user]);

  // Fetch Private Leagues Data
  useEffect(() => {
    async function fetchPrivateLeagues() {
      try {
        const leaguesRef = collection(db, 'leagues');
        const q = query(leaguesRef, where('members', 'array-contains', user.uid));
        const snapshot = await getDocs(q);
        const leagues = [];
        snapshot.forEach((docSnap) => {
          leagues.push({ id: docSnap.id, ...docSnap.data() });
        });
        setPrivateLeagues(leagues);
      } catch (error) {
        console.error('Error fetching private leagues:', error);
      } finally {
        setLoadingPrivate(false);
      }
    }
    if (user) {
      fetchPrivateLeagues();
    }
  }, [user]);

  // Open Full Leaderboard Modal (global or country)
  const openFullLeaderboard = async () => {
    setLoadingFullLeaderboard(true);
    try {
      const usersRef = collection(db, 'users');
      let q;
      if (publicTab === 'country' && currentUserData?.country) {
        q = query(
          usersRef,
          where('country', '==', currentUserData.country),
          orderBy('points', 'desc')
        );
      } else {
        q = query(usersRef, orderBy('points', 'desc'));
      }
      const snapshot = await getDocs(q);
      const users = [];
      snapshot.forEach((docSnap) => {
        users.push({ id: docSnap.id, ...docSnap.data() });
      });
      setFullLeaderboard(users);
      setShowLeaderboardModal(true);
    } catch (error) {
      console.error('Error fetching full leaderboard:', error);
    } finally {
      setLoadingFullLeaderboard(false);
    }
  };

  return (
    <div className="p-0 md:p-1">
      {/* Header */}
      <h2 className="text-4xl font-bold text-white drop-shadow-lg text-center mb-8">
        Leagues Dashboard
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Public Leagues Panel */}
        <section className="bg-[#37003C] rounded-xl p-6 shadow-xl border border-[#01FF86]">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            Public Leagues
          </h3>
          <div className="flex justify-center mb-6 space-x-4">
            <button
              disabled={loadingOverall || loadingCountry || loadingFullLeaderboard}
              onClick={() => setPublicTab('overall')}
              className={`py-2 px-5 rounded-lg transition-colors duration-200 ${
                publicTab === 'overall'
                  ? 'bg-[#01FF86] text-[#37003C]'
                  : 'bg-[#37003C] text-white hover:bg-[#37003C]/80'
              }`}
            >
              <span className="mr-2 text-lg">🌐</span> Global League
            </button>
            <button
              disabled={loadingOverall || loadingCountry || loadingFullLeaderboard}
              onClick={() => setPublicTab('country')}
              className={`py-2 px-5 rounded-lg transition-colors duration-200 ${
                publicTab === 'country'
                  ? 'bg-[#01FF86] text-[#37003C]'
                  : 'bg-[#37003C] text-white hover:bg-[#37003C]/80'
              }`}
            >
              <span className="mr-2 text-lg">
                {currentUserData?.country ? getCountryFlag(currentUserData.country) : '🏳️'}
              </span>
              {currentUserData?.country ? `${currentUserData.country} League` : 'Country League'}
            </button>
          </div>

          {publicTab === 'overall' ? (
            <div>
              {loadingOverall ? (
                <p className="text-white text-center">Loading overall data…</p>
              ) : (
                <>
                  <p className="text-white text-center mb-2">
                    Your Rank: <span className="font-bold">{overallData.userRank || 'N/A'}</span>
                  </p>
                  <p className="text-white text-center mb-4">
                    Total Members: <span className="font-bold">{overallData.totalCount}</span>
                  </p>
                  <h4 className="text-xl font-semibold text-white mb-4 text-center">
                    Top 10 Users
                  </h4>
                  <ul className="divide-y divide-[#01FF86]">
                    {overallData.topUsers.map((u, idx) => (
                      <li
                        key={u.id}
                        className="py-2 px-4 flex justify-between text-white hover:bg-[#290038] transition-colors duration-150"
                      >
                        <span>
                          {idx + 1}. {u.teamName} <span className="italic">({u.name})</span>
                        </span>
                        <span>{u.points} pts</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center mt-6">
                    <button
                      disabled={loadingFullLeaderboard}
                      onClick={openFullLeaderboard}
                      className="inline-flex items-center bg-[#01FF86] text-[#37003C] px-6 py-2 rounded-lg hover:bg-[#01FF86]/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingFullLeaderboard && <Spinner />}
                      <span>View Full Global Leaderboard</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>
              {loadingCountry ? (
                <p className="text-white text-center">Loading country data…</p>
              ) : (
                <>
                  <p className="text-white text-center mb-2">
                    Country: <span className="font-bold">{currentUserData?.country}</span>
                  </p>
                  <p className="text-white text-center mb-4">
                    Your Local Rank: <span className="font-bold">{countryData.userRank || 'N/A'}</span>
                  </p>
                  <h4 className="text-xl font-semibold text-white mb-4 text-center">
                    Top 10 Users
                  </h4>
                  <ul className="divide-y divide-[#01FF86]">
                    {countryData.topUsers.map((u, idx) => (
                      <li
                        key={u.id}
                        className="py-2 px-4 flex justify-between text-white hover:bg-[#290038] transition-colors duration-150"
                      >
                        <span>
                          {idx + 1}. {u.teamName} <span className="italic">({u.name})</span>
                        </span>
                        <span>{u.points} pts</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-center mt-6">
                    <button
                      disabled={loadingFullLeaderboard}
                      onClick={openFullLeaderboard}
                      className="inline-flex items-center bg-[#01FF86] text-[#37003C] px-6 py-2 rounded-lg hover:bg-[#01FF86]/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingFullLeaderboard && <Spinner />}
                      <span>
                        View Full {currentUserData?.country ? `${getCountryFlag(currentUserData.country)} ${currentUserData.country}` : 'Country'} Leaderboard
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Private Leagues Panel */}
        <section className="bg-[#37003C] rounded-xl p-6 shadow-xl border border-[#01FF86]">
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            Private Leagues
          </h3>
          {loadingPrivate ? (
            <p className="text-white text-center">Loading your leagues…</p>
          ) : privateLeagues.length > 0 ? (
            <div className="space-y-4">
              {privateLeagues.map((league) => (
                <div
                  key={league.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#01FF86] rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <h4 className="text-xl font-bold text-white">{league.name}</h4>
                    <p className="text-white">Members: {league.members.length}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={() => {
                        setSelectedLeague(league);
                        setShowPrivateLeagueModal(true);
                      }}
                      className="px-4 py-2 border border-[#01FF86] rounded-lg text-white hover:bg-[#37003C]/80 transition"
                    >
                      View Details
                    </button>
                    {league.creator === user.uid && (
                      <button
                        onClick={() => {
                          setSelectedLeague(league);
                          setShowShareModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-[#01FF86] text-[#37003C] rounded-lg hover:bg-[#01FF86]/80 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm">Share</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white text-center">You haven't joined any private leagues yet.</p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 inline-flex items-center justify-center bg-[#01FF86] text-[#37003C] py-3 rounded-lg hover:bg-[#01FF86]/80 transition duration-200"
            >
              Create League
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 inline-flex items-center justify-center bg-[#01FF86] text-[#37003C] py-3 rounded-lg hover:bg-[#01FF86]/80 transition duration-200"
            >
              Join League
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      {showLeaderboardModal && (
        <LeaderboardModal
          onClose={() => setShowLeaderboardModal(false)}
          fullLeaderboard={fullLeaderboard}
          loading={loadingFullLeaderboard}
        />
      )}

      {showPrivateLeagueModal && selectedLeague && (
        <PrivateLeagueModal
          league={selectedLeague}
          onClose={() => {
            setShowPrivateLeagueModal(false);
            setSelectedLeague(null);
          }}
        />
      )}

      {showCreateModal && <CreateLeagueModal onClose={() => setShowCreateModal(false)} />}
      {showJoinModal && <JoinLeagueModal onClose={() => setShowJoinModal(false)} />}
      {showShareModal && selectedLeague && (
        <ShareLeagueModal
          onClose={() => setShowShareModal(false)}
          league={selectedLeague}
        />
      )}
    </div>
  );
}

// ========================
// Leaderboard Modal Component
// ========================
function LeaderboardModal({ onClose, fullLeaderboard, loading }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-[#37003C] rounded-xl p-6 relative z-10 w-11/12 md:w-2/3 max-h-screen overflow-y-auto border border-[#01FF86] shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Full Leaderboard</h3>
        {loading ? (
          <p className="text-white text-center">Loading...</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#01FF86]">
                <th className="px-4 py-3 text-left text-white">Rank</th>
                <th className="px-4 py-3 text-left text-white">Team</th>
                <th className="px-4 py-3 text-left text-white">Points</th>
              </tr>
            </thead>
            <tbody>
              {fullLeaderboard.map((u, idx) => (
                <tr key={u.id} className="border-b border-[#01FF86] hover:bg-[#290038] transition-colors duration-150">
                  <td className="px-4 py-3 text-white">{idx + 1}</td>
                  <td className="px-4 py-3 text-white">{u.teamName} <span className="italic">({u.name})</span></td>
                  <td className="px-4 py-3 text-white">{u.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-[#01FF86] text-[#37003C] px-6 py-2 rounded-lg hover:bg-[#01FF86]/80 transition duration-200"
          >
            Close
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-[#01FF86] transition duration-150"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ========================
// Private League Modal Component
// ========================
function PrivateLeagueModal({ league, onClose }) {
  const [leagueMembers, setLeagueMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    async function fetchLeagueMembers() {
      try {
        const promises = league.members.map((memberUID) =>
          getDoc(doc(db, 'users', memberUID)).then((docSnap) => {
            if (docSnap.exists()) {
              return { uid: memberUID, ...docSnap.data() };
            }
            return null;
          })
        );
        const results = await Promise.all(promises);
        const validMembers = results.filter((x) => x !== null);
        validMembers.sort((a, b) => b.points - a.points);
        setLeagueMembers(validMembers);
      } catch (error) {
        console.error('Error fetching league members:', error);
      } finally {
        setLoadingMembers(false);
      }
    }
    fetchLeagueMembers();
  }, [league]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-[#37003C] rounded-xl p-6 relative z-10 w-11/12 md:w-2/3 max-h-screen overflow-y-auto border border-[#01FF86] shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          {league.name} League Table
        </h3>
        {loadingMembers ? (
          <p className="text-white text-center">Loading league members...</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#01FF86]">
                <th className="px-4 py-3 text-left text-white">Rank</th>
                <th className="px-4 py-3 text-left text-white">Team</th>
                <th className="px-4 py-3 text-left text-white">Points</th>
              </tr>
            </thead>
            <tbody>
              {leagueMembers.map((member, idx) => (
                <tr key={member.uid} className="border-b border-[#01FF86] hover:bg-[#290038] transition-colors duration-150">
                  <td className="px-4 py-3 text-white">{idx + 1}</td>
                  <td className="px-4 py-3 text-white">{member.teamName} <span className="italic">({member.name})</span></td>
                  <td className="px-4 py-3 text-white">{member.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-[#01FF86] text-[#37003C] px-6 py-2 rounded-lg hover:bg-[#01FF86]/80 transition duration-200"
          >
            Close
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-[#01FF86] transition duration-150"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ========================
// Create League Modal Component
// ========================
function CreateLeagueModal({ onClose }) {
  const { user } = useAuthStore();
  const [leagueName, setLeagueName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (leagueName.trim() === '') return;
    setCreating(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const leagueData = {
        name: leagueName.trim(),
        code: code,
        creator: user.uid,
        creatorTeamName: user.teamName || "",
        country: user.country || "",
        members: [user.uid],
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'leagues'), leagueData);
      await updateDoc(doc(db, 'users', user.uid), {
        leagues: arrayUnion(code),
      });
      setGeneratedCode(code);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating league:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-[#37003C] rounded-xl p-6 relative z-10 w-11/12 md:w-1/2 border border-[#01FF86] shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Create League</h3>
        {success ? (
          <div className="text-white mb-6 text-center">
            <p className="text-[#01FF86] font-bold mb-4">✓ League created successfully!</p>
            <div className="p-6 rounded-xl border border-[#01FF86] mb-4">
              <p className="text-xl">Your League Code:</p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-3xl font-bold tracking-wider mr-4">{generatedCode}</span>
                <button
                  onClick={() => {
                    // Use fallback copy logic if necessary
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(generatedCode)
                        .then(() => alert("Copied to clipboard!"))
                        .catch((err) => {
                          console.error('Error copying text: ', err);
                          alert("Failed to copy. Please try manually.");
                        });
                    } else {
                      const textArea = document.createElement("textarea");
                      textArea.value = generatedCode;
                      textArea.style.position = "fixed";
                      textArea.style.top = "0";
                      textArea.style.left = "0";
                      textArea.style.width = "2em";
                      textArea.style.height = "2em";
                      textArea.style.padding = "0";
                      textArea.style.border = "none";
                      textArea.style.outline = "none";
                      textArea.style.boxShadow = "none";
                      textArea.style.background = "transparent";
                      document.body.appendChild(textArea);
                      textArea.focus();
                      textArea.select();
                      try {
                        document.execCommand('copy');
                        alert("Copied to clipboard!");
                      } catch (err) {
                        console.error('Fallback: Unable to copy', err);
                        alert("Failed to copy. Please try manually.");
                      }
                      document.body.removeChild(textArea);
                    }
                  }}
                  className="text-[#01FF86] hover:text-[#01FF86]/80 text-xl transition-colors duration-150"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm mt-4">
                Share this code with friends to join your league.
              </p>
            </div>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter League Name"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              className="w-full p-4 rounded border border-[#01FF86] mb-6 bg-[#37003C] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#01FF86] transition duration-150"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full inline-flex items-center justify-center bg-[#01FF86] text-[#37003C] py-3 rounded-lg hover:bg-[#01FF86]/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating && <Spinner />}
              {creating ? 'Creating...' : 'Create League'}
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-[#01FF86] transition duration-150"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ========================
// Join League Modal Component
// ========================
function JoinLeagueModal({ onClose }) {
  const { user } = useAuthStore();
  const [leagueCode, setLeagueCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingJoin, setLoadingJoin] = useState(false);

  const handleJoin = async () => {
    if (leagueCode.trim() === '') {
      setError('Please enter a league code.');
      return;
    }
    if (leagueCode.trim().length !== 6) {
      setError('Invalid league code.');
      return;
    }
    setLoadingJoin(true);
    try {
      const leaguesRef = collection(db, 'leagues');
      const q = query(
        leaguesRef,
        where('code', '==', leagueCode.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError('League not found.');
        setLoadingJoin(false);
        return;
      }
      let leagueDoc = null;
      snapshot.forEach((docSnap) => {
        leagueDoc = { id: docSnap.id, ...docSnap.data() };
      });
      if (leagueDoc) {
        if (!leagueDoc.members.includes(user.uid)) {
          const leagueDocRef = doc(db, 'leagues', leagueDoc.id);
          await updateDoc(leagueDocRef, {
            members: [...leagueDoc.members, user.uid],
          });
        }
      }
      setSuccess('LEAGUE JOINED SUCCESSFULLY (Please refresh to see your league)');
    } catch (error) {
      console.error('Error joining league:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoadingJoin(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-[#37003C] rounded-xl p-6 relative z-10 w-11/12 md:w-1/3 border border-[#01FF86] shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Join League</h3>
        <input
          type="text"
          placeholder="Enter League Code"
          value={leagueCode}
          onChange={(e) => {
            setLeagueCode(e.target.value);
            setError('');
            setSuccess('');
          }}
          className="w-full p-4 rounded border border-[#01FF86] mb-6 bg-[#37003C] text-white placeholder-gray-400 focus:ring-2 focus:ring-[#01FF86] transition duration-150"
          disabled={loadingJoin || success}
        />
        {success && (
          <p className="text-green-400 mb-6 text-center transition duration-150">{success}</p>
        )}
        {error && (
          <p className="text-red-400 mb-6 text-center transition duration-150">{error}</p>
        )}
        {!success && (
          <button
            onClick={handleJoin}
            disabled={loadingJoin}
            className="w-full inline-flex items-center justify-center bg-[#01FF86] text-[#37003C] py-3 rounded-lg hover:bg-[#01FF86]/80 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingJoin && <Spinner />}
            {loadingJoin ? 'Joining...' : 'Join League'}
          </button>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-[#01FF86] transition duration-150"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

// ========================
// Share League Modal Component
// ========================
function ShareLeagueModal({ onClose, league }) {
  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(league.code)
        .then(() => {
          alert('Copied to clipboard!');
        })
        .catch((err) => {
          console.error('Error copying text: ', err);
          alert('Failed to copy. Please try manually.');
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = league.code;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Copied to clipboard!');
      } catch (err) {
        console.error('Fallback: Unable to copy', err);
        alert('Failed to copy. Please try manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-[#37003C] rounded-xl p-6 relative z-10 w-11/12 md:w-1/3 border border-[#01FF86] shadow-xl">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Share League</h3>
        <div className="text-white mb-6">
          <p className="mb-2 text-center">
            League Name: <span className="font-bold">{league.name}</span>
          </p>
          <div className="p-6 rounded-xl border border-[#01FF86] flex flex-col items-center">
            <p className="text-xl mb-2">League Code:</p>
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold tracking-wider">{league.code}</span>
              <button
                onClick={handleCopy}
                className="text-[#01FF86] hover:text-[#01FF86]/80 text-xl transition-colors duration-150"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-[#01FF86] text-[#37003C] px-6 py-2 rounded-lg hover:bg-[#01FF86]/80 transition duration-200"
          >
            Close
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-3xl hover:text-[#01FF86] transition duration-150"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
