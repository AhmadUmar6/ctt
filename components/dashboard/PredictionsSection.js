'use client';

import MatchCard from './MatchCard';

export const matches = [
  {
    id: 1,
    team1: { name: 'Pakistan', logo: '/pakistan.png' },
    team2: { name: 'New Zealand', logo: '/newzealand.png' },
    matchday: '1st Match, Group A',
    startTime: '2025-02-19T09:00:00Z',
    recentForm: {
      team1: ['L', 'W', 'L'],
      team2: ['w', 'W', 'W'],
    },
  },
  {
    id: 2,
    team1: { name: 'Bangladesh', logo: '/bangladesh.png' },
    team2: { name: 'India', logo: '/india.png' },
    matchday: '2nd Match, Group A',
    startTime: '2025-02-20T09:00:00Z',
    recentForm: {
      team1: ['L', 'L', 'L'],
      team2: ['W', 'W', 'W'],
    },
  },
  {
    id: 3,
    team1: { name: 'Afghanistan', logo: '/afghanistan.png' },
    team2: { name: 'South Africa', logo: '/southafrica.png' },
    matchday: '3rd Match, Group B',
    startTime: '2025-02-21T09:00:00Z',
    recentForm: {
      team1: ['W', 'W', 'W'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 4,
    team1: { name: 'Australia', logo: '/australia.png' },
    team2: { name: 'England', logo: '/england.png' },
    matchday: '4th Match, Group B',
    startTime: '2025-02-22T09:00:00Z',
    recentForm: {
      team1: ['L', 'L', 'L'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 5,
    team1: { name: 'Pakistan', logo: '/pakistan.png' },
    team2: { name: 'India', logo: '/india.png' },
    matchday: '5th Match, Group A',
    startTime: '2025-02-23T09:00:00Z',
    recentForm: {
      team1: ['L', 'W', 'L'],
      team2: ['W', 'W', 'W'],
    },
  },
  {
    id: 6,
    team1: { name: 'Bangladesh', logo: '/bangladesh.png' },
    team2: { name: 'New Zealand', logo: '/newzealand.png' },
    matchday: '6th Match, Group A',
    startTime: '2025-02-24T09:00:00Z',
    recentForm: {
      team1: ['L', 'L', 'L'],
      team2: ['W', 'W', 'W'],
    },
  },
  {
    id: 7,
    team1: { name: 'Australia', logo: '/australia.png' },
    team2: { name: 'South Africa', logo: '/southafrica.png' },
    matchday: '7th Match, Group B',
    startTime: '2025-02-25T09:00:00Z',
    recentForm: {
      team1: ['L', 'L', 'L'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 8,
    team1: { name: 'Afghanistan', logo: '/afghanistan.png' },
    team2: { name: 'England', logo: '/england.png' },
    matchday: '8th Match, Group B',
    startTime: '2025-02-26T09:00:00Z',
    recentForm: {
      team1: ['W', 'W', 'W'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 9,
    team1: { name: 'Pakistan', logo: '/pakistan.png' },
    team2: { name: 'Bangladesh', logo: '/bangladesh.png' },
    matchday: '9th Match, Group A',
    startTime: '2025-02-27T09:00:00Z',
    recentForm: {
      team1: ['L', 'W', 'L'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 10,
    team1: { name: 'Afghanistan', logo: '/afghanistan.png' },
    team2: { name: 'Australia', logo: '/australia.png' },
    matchday: '10th Match, Group B',
    startTime: '2025-02-28T09:00:00Z',
    recentForm: {
      team1: ['W', 'W', 'W'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 11,
    team1: { name: 'South Africa', logo: '/southafrica.png' },
    team2: { name: 'England', logo: '/england.png' },
    matchday: '11th Match, Group B',
    startTime: '2025-03-01T09:00:00Z',
    recentForm: {
      team1: ['L', 'L', 'L'],
      team2: ['L', 'L', 'L'],
    },
  },
  {
    id: 12,
    team1: { name: 'New Zealand', logo: '/newzealand.png' },
    team2: { name: 'India', logo: '/india.png' },
    matchday: '12th Match, Group A',
    startTime: '2025-03-02T09:00:00Z',
    recentForm: {
      team1: ['W', 'W', 'W'],
      team2: ['W', 'W', 'W'],
    },
  },
  {
    id: 13,
    team1: { name: 'Australia', logo: '/australia.png' },
    team2: { name: 'India', logo: '/india.png' },
    matchday: '1st Semi-Final (A1 v B2)',
    startTime: '2025-03-04T09:00:00Z',
    recentForm: {
      team1: ['W', 'NR', 'NR'],
      team2: ['W', 'W', 'W'],
    },
  },
  {
    id: 14,
    team1: { name: 'New Zealand', logo: '/newzealand.png' },
    team2: { name: 'South Africa', logo: '/southafrica.png' },
    matchday: '2nd Semi-Final (B1 v A2)',
    startTime: '2025-03-05T09:00:00Z',
    recentForm: {
      team1: ['W', 'W', 'L'],
      team2: ['W', 'NR', 'W'],
    },
  },
  {
    id: 15,
    team1: { name: 'TBC', logo: '/tbc.png' },
    team2: { name: 'TBC', logo: '/tbc.png' },
    matchday: 'Final',
    startTime: '2025-03-09T09:00:00Z',
    recentForm: {
      team1: ['T', 'T', 'T'],
      team2: ['T', 'T', 'T'],
    },
  },
];

export default function PredictionsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
