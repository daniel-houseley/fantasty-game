import { useState, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/api'
const BUDGET = 25
const STATS = ['ppg', 'rpg', 'apg', 'spg', 'bpg']
const STAT_LABELS = {
  ppg: 'Points',
  rpg: 'Rebounds',
  apg: 'Assists',
  spg: 'Steals',
  bpg: 'Blocks'
}

function App() {
  const [screen, setScreen] = useState('menu') // menu, create, join, build, waiting, results
  const [players, setPlayers] = useState([])
  const [gameNight, setGameNight] = useState(null)
  const [gameId, setGameId] = useState('')
  const [playerNumber, setPlayerNumber] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [selections, setSelections] = useState({})
  const [spent, setSpent] = useState(0)
  const [game, setGame] = useState(null)
  const [error, setError] = useState('')
  const [revealIndex, setRevealIndex] = useState(-1)
  const [showWinner, setShowWinner] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/players`)
      .then(res => res.json())
      .then(setPlayers)
      .catch(err => console.error('Failed to load players:', err))

    fetch(`${API_URL}/gamenight`)
      .then(res => res.json())
      .then(setGameNight)
      .catch(err => console.error('Failed to load game night:', err))
  }, [])

  const createGame = async () => {
    const res = await fetch(`${API_URL}/games`, { method: 'POST' })
    const data = await res.json()
    setGameId(data.gameId)
    setPlayerNumber(1)
    setScreen('build')
  }

  const joinGame = async () => {
    try {
      const res = await fetch(`${API_URL}/games/${joinCode}/join`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error)
        return
      }
      const data = await res.json()
      setGameId(joinCode)
      setPlayerNumber(data.playerNumber)
      setScreen('build')
    } catch {
      setError('Failed to join game')
    }
  }

  const selectStat = (stat, player) => {
    const newSelections = { ...selections }
    const oldSelection = selections[stat]
    let newSpent = spent

    // If clicking the same player's stat, deselect it
    if (oldSelection?.playerId === player.id) {
      delete newSelections[stat]
      newSpent -= oldSelection.cost
      setSelections(newSelections)
      setSpent(newSpent)
      return
    }

    // Remove old cost if switching
    if (oldSelection) {
      newSpent -= oldSelection.cost
    }

    // Add new cost
    const cost = player.costs[stat]
    newSpent += cost

    newSelections[stat] = {
      playerId: player.id,
      playerName: player.name,
      value: player[stat],
      cost
    }

    setSelections(newSelections)
    setSpent(newSpent)
  }

  const submitBuild = async () => {
    if (Object.keys(selections).length !== 5) {
      setError('Select one stat from each category')
      return
    }
    if (spent > BUDGET) {
      setError('Over budget!')
      return
    }

    const build = {
      stats: {},
      selections: {}
    }
    Object.entries(selections).forEach(([stat, sel]) => {
      build.stats[stat] = sel.value
      build.selections[stat] = { playerName: sel.playerName, value: sel.value }
    })

    const res = await fetch(`${API_URL}/games/${gameId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerNumber, build })
    })
    const data = await res.json()
    setGame(data)

    if (data.status === 'complete') {
      setScreen('results')
      startCinematicReveal()
    } else {
      setScreen('waiting')
      pollForResults()
    }
  }

  const pollForResults = () => {
    const interval = setInterval(async () => {
      const res = await fetch(`${API_URL}/games/${gameId}`)
      const data = await res.json()
      if (data.status === 'complete') {
        setGame(data)
        setScreen('results')
        startCinematicReveal()
        clearInterval(interval)
      }
    }, 2000)
  }

  const startCinematicReveal = () => {
    setRevealIndex(-1)
    setShowWinner(false)
    let idx = 0
    const revealInterval = setInterval(() => {
      setRevealIndex(idx)
      idx++
      if (idx >= 5) {
        clearInterval(revealInterval)
        setTimeout(() => setShowWinner(true), 1000)
      }
    }, 800)
  }

  // Menu Screen
  if (screen === 'menu') {
    return (
      <div className="container">
        <h1>🏀 Raptors Fantasy Builder</h1>
        <p className="subtitle">Build your dream player from Raptors stats</p>

        <div className="menu-buttons">
          <button className="btn primary" onClick={createGame}>
            Create Game
          </button>

          <div className="join-section">
            <input
              type="text"
              placeholder="Enter game code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button className="btn secondary" onClick={joinGame}>
              Join Game
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>

        {gameNight && (
          <div className="game-night-info">
            <h3>Target Game Night</h3>
            <p>{gameNight.date} vs {gameNight.opponent}</p>
          </div>
        )}
      </div>
    )
  }

  // Build Screen
  if (screen === 'build') {
    const selectionCount = Object.keys(selections).length

    return (
      <div className="container">
        <div className="sticky-progress">
          <div className="sticky-stats">
            {STATS.map(stat => (
              <div key={stat} className={`sticky-stat ${selections[stat] ? 'filled' : ''}`}>
                <span className="sticky-label">{stat.toUpperCase()}</span>
                <span className="sticky-value">{selections[stat]?.value ?? '—'}</span>
              </div>
            ))}
          </div>
          <div className="sticky-budget">
            <span className={spent > BUDGET ? 'over' : ''}>{spent}/{BUDGET}</span>
            <span className="sticky-count">{selectionCount}/5</span>
          </div>
        </div>

        <div className="header">
          <h1>🏀 Build Your Player</h1>
          <div className="game-info">
            <span className="game-code">Game: {gameId}</span>
            <span className="player-badge">Player {playerNumber}</span>
          </div>
        </div>

        <div className="budget-bar">
          <span>Budget: {spent} / {BUDGET}</span>
          <div className="progress">
            <div
              className={`progress-fill ${spent > BUDGET ? 'over' : ''}`}
              style={{ width: `${Math.min((spent / BUDGET) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="build-summary">
          <h3>Your Build</h3>
          <div className="raptor-builder">
            <div className={`raptor-dino ${Object.keys(selections).length === 5 ? 'complete' : ''}`}>
              <div className="dino-body">🦖</div>
              <div className="dino-stats">
                {STATS.map(stat => (
                  <div key={stat} className={`dino-stat ${selections[stat] ? 'active' : ''}`}>
                    {selections[stat] ? selections[stat].value : '?'}
                  </div>
                ))}
              </div>
            </div>
            <div className="selections">
              {STATS.map(stat => (
                <div key={stat} className={`selection ${selections[stat] ? 'selected' : ''}`}>
                  <span className="stat-label">{STAT_LABELS[stat]}</span>
                  {selections[stat] ? (
                    <span className="stat-value">
                      {selections[stat].value} ({selections[stat].playerName})
                    </span>
                  ) : (
                    <span className="stat-empty">Select below</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {STATS.map(stat => (
          <div key={stat} className="stat-section">
            <h3>{STAT_LABELS[stat]}</h3>
            <div className="player-grid">
              {players.map(player => (
                <button
                  key={player.id}
                  className={`player-card ${selections[stat]?.playerId === player.id ? 'selected' : ''}`}
                  onClick={() => selectStat(stat, player)}
                >
                  <span className="player-name">{player.name}</span>
                  <span className="player-stat">{player[stat]}</span>
                  <span className="player-cost">{player.costs[stat]} pts</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="error">{error}</p>}

        <button
          className="btn primary submit-btn"
          onClick={submitBuild}
          disabled={Object.keys(selections).length !== 5 || spent > BUDGET}
        >
          Submit Build
        </button>
      </div>
    )
  }

  // Waiting Screen
  if (screen === 'waiting') {
    return (
      <div className="container center">
        <h1>⏳ Waiting for Opponent</h1>
        <p>Game Code: <strong>{gameId}</strong></p>
        <p>Share this code with your opponent!</p>
        <div className="loader"></div>
      </div>
    )
  }

  // Results Screen
  if (screen === 'results' && game?.results) {
    const { results } = game
    const p1Score = results.breakdown.filter((_, i) => i <= revealIndex && results.breakdown[i].winner === 1).length
    const p2Score = results.breakdown.filter((_, i) => i <= revealIndex && results.breakdown[i].winner === 2).length

    return (
      <div className="container results-screen">
        <h1>Showdown</h1>

        <div className="matchup-arena">
          <div className={`fighter p1 ${showWinner && results.winner === 1 ? 'winner' : ''}`}>
            <div className="fighter-dino">🦖</div>
            <div className="fighter-label">Player 1</div>
            <div className="fighter-score">{p1Score}</div>
            {showWinner && results.winner === 1 && <div className="trophy">🏆</div>}
          </div>

          <div className="vs-badge">VS</div>

          <div className={`fighter p2 ${showWinner && results.winner === 2 ? 'winner' : ''}`}>
            <div className="fighter-dino">🦖</div>
            <div className="fighter-label">Player 2</div>
            <div className="fighter-score">{p2Score}</div>
            {showWinner && results.winner === 2 && <div className="trophy">🏆</div>}
          </div>
        </div>

        <div className="reveal-cards">
          {results.breakdown.map((row, idx) => (
            <div
              key={row.stat}
              className={`reveal-card ${idx <= revealIndex ? 'revealed' : ''} ${idx <= revealIndex ? (row.winner === 1 ? 'p1-win' : row.winner === 2 ? 'p2-win' : 'tie') : ''}`}
            >
              <div className="card-inner">
                <div className="card-category">{STAT_LABELS[row.stat]}</div>
                <div className="card-target">Target: {row.target}</div>
                <div className="card-values">
                  <span className={row.winner === 1 ? 'winner' : ''}>{row.build1}</span>
                  <span className="vs">vs</span>
                  <span className={row.winner === 2 ? 'winner' : ''}>{row.build2}</span>
                </div>
                <div className="card-result">
                  {row.winner === 0 ? 'TIE' : `P${row.winner} WINS`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showWinner && (
          <div className={`final-winner player${results.winner}`}>
            {results.winner === 0 ? (
              <span>It's a Tie!</span>
            ) : (
              <>
                <span className="trophy-large">🏆</span>
                <span>Player {results.winner} Wins!</span>
                <span className="final-score">{results.player1Wins} - {results.player2Wins}</span>
              </>
            )}
          </div>
        )}

        {showWinner && (
          <button className="btn primary" onClick={() => window.location.reload()}>
            Play Again
          </button>
        )}
      </div>
    )
  }

  return null
}

export default App
