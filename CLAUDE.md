# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Raptors Fantasy Builder - A 2-player web game where users build custom basketball players using stats from the Toronto Raptors roster, then compete to see whose build comes closest to a real game night performance.

## Commands

### Server (port 3001)
```bash
cd server && npm install
cd server && npm run dev   # Development with auto-reload
cd server && npm start     # Production
```

### Client (port 5173)
```bash
cd client && npm install
cd client && npm run dev   # Development server
cd client && npm run build # Production build
```

Run both server and client simultaneously for development.

## Architecture

```
server/
  index.js    - Express API: game creation, joining, submissions, results calculation
  data.js     - Raptors player stats, point costs, game night target stats

client/
  src/App.jsx - Single-page React app with all screens (menu, build, waiting, results)
  src/App.css - Raptors-themed styling (red/dark theme)
```

## Game Mechanics

1. **Point-buy system**: Each stat costs 1-10 points based on quality (better stats = higher cost)
2. **5 categories**: Points, Rebounds, Assists, Steals, Blocks (PPG, RPG, APG, SPG, BPG)
3. **Build rule**: Select exactly one Raptor's stat from each category
4. **Budget**: 25 points total
5. **Scoring**: Compare builds to game night stats; closest to target in each category wins that category; most categories won = winner

## API Endpoints

- `GET /api/players` - All players with stats and costs
- `GET /api/gamenight` - Target game stats
- `POST /api/games` - Create new game, returns game code
- `POST /api/games/:id/join` - Join existing game
- `POST /api/games/:id/submit` - Submit player build
- `GET /api/games/:id` - Get game state
