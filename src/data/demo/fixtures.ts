import type { TeamInfo } from '../../types/match';

export interface FixtureOver {
  bowler: string;
  deliveries: string;
}

export interface FixtureMatch {
  match_id: string;
  tournament: string;
  match_number: string;
  venue: string;
  match_date: string;
  teams: [TeamInfo, TeamInfo];
  first_innings: { score: number; wickets: number };
  chase_batting_order: string[];
  chase_overs: FixtureOver[];
  replay_start_over: number;
}

/*
 * Delivery tokens: "0" dot ball, "1"-"6" runs off the bat, "W" wicket,
 * "lb" one leg bye, "wd" wide, "nb" no-ball (one extra run each).
 * Every over lists exactly six legal deliveries plus any extras.
 */
export const DEMO_FIXTURES: FixtureMatch[] = [
  {
    match_id: 'demo-t20-northern-coastal',
    tournament: 'MatchLens Demo T20 Cup',
    match_number: 'Match 14 of 24',
    venue: 'Harbour Oval, Demo City',
    match_date: '2026-10-18',
    teams: [
      { name: 'Northern Strikers', code: 'NS' },
      { name: 'Coastal Kings', code: 'CK' },
    ],
    first_innings: { score: 182, wickets: 5 },
    chase_batting_order: [
      'Rohan Kapoor',
      'Sameer Iyer',
      'Liam Carter',
      'Jordan Reyes',
      'Kabir Shah',
      'Vikram Rao',
      'Ethan D’Souza',
      'Noah Brooks',
      'Farhan Ali',
      'Mateo Silva',
      'Ravi Teja',
    ],
    chase_overs: [
      { bowler: 'Arjun Mehta', deliveries: '0 4 1 0 wd 2 1' },
      { bowler: 'Daniel Okafor', deliveries: '1 1 0 6 0 2' },
      { bowler: 'Hassan Rahim', deliveries: '0 1 W 4 1 0' },
      { bowler: 'Lewis Porter', deliveries: '2 0 4 nb 6 1 1' },
      { bowler: 'Sanjay Nair', deliveries: '1 4 0 0 1 W' },
      { bowler: 'Arjun Mehta', deliveries: '4 6 1 0 2 0' },
      { bowler: 'Daniel Okafor', deliveries: '0 1 0 wd 1 W 4' },
      { bowler: 'Hassan Rahim', deliveries: '1 2 4 0 1 1' },
      { bowler: 'Lewis Porter', deliveries: '0 0 2 6 W 1' },
      { bowler: 'Sanjay Nair', deliveries: '1 0 1 2 1 0' },
      { bowler: 'Arjun Mehta', deliveries: '0 0 wd 0 W 1 1' },
      { bowler: 'Daniel Okafor', deliveries: '4 0 1 6 1 0' },
      { bowler: 'Hassan Rahim', deliveries: '1 0 0 nb 2 W 1' },
      { bowler: 'Lewis Porter', deliveries: '2 1 0 4 0 1' },
      { bowler: 'Sanjay Nair', deliveries: '0 6 1 0 1 0' },
      { bowler: 'Arjun Mehta', deliveries: '1 4 2 0 6 1' },
      { bowler: 'Daniel Okafor', deliveries: '0 W 1 4 0 1' },
      { bowler: 'Hassan Rahim', deliveries: '6 0 2 1 4 1 wd' },
      { bowler: 'Lewis Porter', deliveries: '1 4 W 2 4 0' },
      { bowler: 'Sanjay Nair', deliveries: '1 0 wd 0 1 2 0' },
    ],
    replay_start_over: 16,
  },
  {
    match_id: 'demo-t20-harbour-metro',
    tournament: 'MatchLens Demo T20 Cup',
    match_number: 'Match 21 of 24',
    venue: 'Lighthouse Park, Demo City',
    match_date: '2026-10-24',
    teams: [
      { name: 'Harbour Hawks', code: 'HH' },
      { name: 'Metro Giants', code: 'MG' },
    ],
    first_innings: { score: 164, wickets: 7 },
    chase_batting_order: [
      'Jamal Price',
      'Owen Lyle',
      'Kian Patel',
      'Bruno Keane',
      'Tom Hadley',
      'Arun Bose',
      'Felix Dunn',
      'Ishaan Gill',
      'Omar Haddad',
      'Pete Lowe',
      'Sam Ward',
    ],
    chase_overs: [
      { bowler: 'Nathan Cole', deliveries: '1 1 4 0 0 2' },
      { bowler: 'Rafael Costa', deliveries: '0 0 1 W 2 1' },
      { bowler: 'Yusuf Demir', deliveries: '2 6 0 1 0 1 wd' },
      { bowler: 'Ben Ashworth', deliveries: '0 0 1 1 4 W' },
      { bowler: 'Kyle Mensah', deliveries: '1 0 0 nb 2 1 0' },
      { bowler: 'Nathan Cole', deliveries: '4 1 0 0 W 1' },
      { bowler: 'Rafael Costa', deliveries: '0 2 0 1 lb 0' },
      { bowler: 'Yusuf Demir', deliveries: '6 1 0 W 2 1' },
      { bowler: 'Ben Ashworth', deliveries: '0 0 0 1 4 1' },
      { bowler: 'Kyle Mensah', deliveries: 'W 1 2 0 0 1' },
      { bowler: 'Nathan Cole', deliveries: '0 1 0 1 0 wd 0' },
      { bowler: 'Rafael Costa', deliveries: '1 6 0 0 4 0' },
      { bowler: 'Yusuf Demir', deliveries: '0 2 4 W 1 1' },
      { bowler: 'Ben Ashworth', deliveries: '1 1 6 0 1 2' },
      { bowler: 'Kyle Mensah', deliveries: '0 0 W 1 0 0' },
      { bowler: 'Nathan Cole', deliveries: '2 0 1 1 0 4' },
      { bowler: 'Rafael Costa', deliveries: '1 0 4 W 1 0' },
      { bowler: 'Yusuf Demir', deliveries: '4 1 0 nb 1 2 0' },
      { bowler: 'Ben Ashworth', deliveries: '6 0 1 0 wd 0 1' },
      { bowler: 'Kyle Mensah', deliveries: 'W 0 1 1 0 2' },
    ],
    replay_start_over: 12,
  },
];
