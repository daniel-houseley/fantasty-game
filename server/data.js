// Toronto Raptors 2024-25 season stats (approximate)
export const raptorsPlayers = [
  { id: 1, name: "Scottie Barnes", ppg: 19.2, rpg: 8.1, apg: 6.4, spg: 1.2, bpg: 0.9 },
  { id: 2, name: "RJ Barrett", ppg: 21.5, rpg: 6.2, apg: 4.8, spg: 0.8, bpg: 0.4 },
  { id: 3, name: "Immanuel Quickley", ppg: 16.8, rpg: 4.2, apg: 6.2, spg: 1.0, bpg: 0.2 },
  { id: 4, name: "Jakob Poeltl", ppg: 14.2, rpg: 10.8, apg: 2.8, spg: 0.5, bpg: 1.4 },
  { id: 5, name: "Gradey Dick", ppg: 13.5, rpg: 3.1, apg: 2.4, spg: 0.6, bpg: 0.2 },
  { id: 6, name: "Ochai Agbaji", ppg: 8.2, rpg: 3.4, apg: 1.6, spg: 0.7, bpg: 0.3 },
  { id: 7, name: "Chris Boucher", ppg: 7.8, rpg: 5.2, apg: 0.8, spg: 0.4, bpg: 0.8 },
  { id: 8, name: "Kelly Olynyk", ppg: 8.4, rpg: 4.8, apg: 3.2, spg: 0.6, bpg: 0.4 },
  { id: 9, name: "Bruce Brown", ppg: 6.2, rpg: 3.8, apg: 2.2, spg: 0.8, bpg: 0.2 },
  { id: 10, name: "Davion Mitchell", ppg: 7.4, rpg: 2.2, apg: 3.6, spg: 1.1, bpg: 0.1 },
  { id: 11, name: "Ja'Kobe Walter", ppg: 5.8, rpg: 2.0, apg: 1.2, spg: 0.5, bpg: 0.2 },
  { id: 12, name: "Jonathan Mogbo", ppg: 4.2, rpg: 4.6, apg: 1.4, spg: 0.6, bpg: 0.5 }
];

// Game night stats - Raptors vs Nets, Feb 12, 2025 (example game)
// Team totals divided by starters for "average target"
export const gameNightStats = {
  date: "Feb 12, 2025",
  opponent: "Brooklyn Nets",
  // Target stats representing a strong individual performance that night
  ppg: 18.4,
  rpg: 7.2,
  apg: 4.8,
  spg: 1.0,
  bpg: 0.6
};

// Calculate point cost for a stat (higher stats cost more)
export function calculatePointCost(value, statType) {
  const maxValues = {
    ppg: 25,   // Max expected PPG
    rpg: 12,   // Max expected RPG
    apg: 8,    // Max expected APG
    spg: 1.5,  // Max expected SPG
    bpg: 1.5   // Max expected BPG
  };

  // Cost scales from 1-10 based on how good the stat is
  const normalized = value / maxValues[statType];
  return Math.max(1, Math.round(normalized * 10));
}

// Budget each player gets
export const BUDGET = 25;
