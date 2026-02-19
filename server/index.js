import express from 'express';
import cors from 'cors';
import { raptorsPlayers, gameNightStats, calculatePointCost } from './data.js';

const app = express();
app.use(cors());
app.use(express.json());

// Store active games
const games = new Map();

// Get all players with their stats and costs
app.get('/api/players', (req, res) => {
  const playersWithCosts = raptorsPlayers.map(player => ({
    ...player,
    costs: {
      ppg: calculatePointCost(player.ppg, 'ppg'),
      rpg: calculatePointCost(player.rpg, 'rpg'),
      apg: calculatePointCost(player.apg, 'apg'),
      spg: calculatePointCost(player.spg, 'spg'),
      bpg: calculatePointCost(player.bpg, 'bpg')
    }
  }));
  res.json(playersWithCosts);
});

// Get game night stats for comparison
app.get('/api/gamenight', (req, res) => {
  res.json(gameNightStats);
});

// Create a new game
app.post('/api/games', (req, res) => {
  const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
  games.set(gameId, {
    id: gameId,
    player1: null,
    player2: null,
    status: 'waiting'
  });
  res.json({ gameId });
});

// Join a game
app.post('/api/games/:gameId/join', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const playerNumber = game.player1 === null ? 1 : game.player2 === null ? 2 : null;

  if (playerNumber === null) {
    return res.status(400).json({ error: 'Game is full' });
  }

  res.json({ playerNumber, game });
});

// Submit a custom player build
app.post('/api/games/:gameId/submit', (req, res) => {
  const { gameId } = req.params;
  const { playerNumber, build } = req.body;
  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (playerNumber === 1) {
    game.player1 = build;
  } else {
    game.player2 = build;
  }

  // Check if both players have submitted
  if (game.player1 && game.player2) {
    game.status = 'complete';
    game.results = calculateResults(game.player1, game.player2);
  } else {
    game.status = 'waiting_for_opponent';
  }

  games.set(gameId, game);
  res.json(game);
});

// Get game state
app.get('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json(game);
});

// Calculate winner based on game night performance
function calculateResults(build1, build2) {
  const stats = ['ppg', 'rpg', 'apg', 'spg', 'bpg'];
  let player1Wins = 0;
  let player2Wins = 0;
  const breakdown = [];

  stats.forEach(stat => {
    const target = gameNightStats[stat];
    const diff1 = Math.abs(build1.stats[stat] - target);
    const diff2 = Math.abs(build2.stats[stat] - target);

    // Lower difference = closer to actual game performance = wins
    if (diff1 < diff2) {
      player1Wins++;
      breakdown.push({ stat, winner: 1, build1: build1.stats[stat], build2: build2.stats[stat], target });
    } else if (diff2 < diff1) {
      player2Wins++;
      breakdown.push({ stat, winner: 2, build1: build1.stats[stat], build2: build2.stats[stat], target });
    } else {
      breakdown.push({ stat, winner: 0, build1: build1.stats[stat], build2: build2.stats[stat], target });
    }
  });

  return {
    winner: player1Wins > player2Wins ? 1 : player2Wins > player1Wins ? 2 : 0,
    player1Wins,
    player2Wins,
    breakdown
  };
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
