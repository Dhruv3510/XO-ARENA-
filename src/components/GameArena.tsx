import { useEffect, useRef, useState } from 'react'
import type { Board, ChaosState, GameScores, Player, PlayerConfig, WinResult } from '../types/game'
import { checkWinner, getAIMove, getAvailableMoves } from '../utils/ai'
import { soundFx } from '../utils/sound'
import { CinematicVictory } from './CinematicVictory'

interface GameArenaProps {
  config: PlayerConfig
  scores: GameScores
  onUpdateScores: (scores: GameScores) => void
  onMatchComplete: (winner: Player | 'Draw') => void
  onReturnToMenu: () => void
  soundEnabled: boolean
}

export function GameArena({
  config,
  scores,
  onUpdateScores,
  onMatchComplete,
  onReturnToMenu,
  soundEnabled,
}: GameArenaProps) {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentTurn, setCurrentTurn] = useState<Player>('X')
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false)
  const [winResult, setWinResult] = useState<WinResult>({ winner: null, line: null })

  // Chaos Mode State
  const isChaos = Boolean(config.isChaos || config.mode === 'chaos')
  const [chaosState, setChaosState] = useState<ChaosState>({
    activeEvent: null,
    frozenCell: null,
    surgeCell: null,
    glitchActive: false,
    announcement: null,
  })
  const moveCountRef = useRef<number>(0)

  // Track if this round's result has already reported to progression system
  const hasReportedRoundRef = useRef<boolean>(false)

  // Determine game status
  const isGameOver = winResult.winner !== null

  // Determine if opponent is AI
  const isAiOpponent =
    config.mode === 'ai' || (config.mode === 'chaos' && config.chaosOpponent === 'ai')

  // Process human or PvP move
  const handleCellClick = (index: number) => {
    // Prevent move if cell filled, game over, or AI is thinking
    if (board[index] !== null || isGameOver || isAiThinking) {
      return
    }

    // Check if cell is currently frozen in Chaos Mode
    if (isChaos && chaosState.frozenCell === index) {
      soundFx.playFreeze(soundEnabled)
      setChaosState((prev) => ({
        ...prev,
        announcement: '❄️ CELL IS FROZEN! Choose an unfrozen cell.',
      }))
      return
    }

    // In AI mode, human cannot move when it is not 'X' turn
    if (isAiOpponent && currentTurn !== 'X') {
      return
    }

    makeMove(index, currentTurn)
  }

  const makeMove = (index: number, player: Player) => {
    // If cell had power surge, play surge sound
    if (isChaos && chaosState.surgeCell === index) {
      soundFx.playSurge(soundEnabled)
    } else {
      soundFx.playMove(player, soundEnabled)
    }

    const nextBoard = [...board]
    nextBoard[index] = player
    setBoard(nextBoard)

    moveCountRef.current += 1

    const result = checkWinner(nextBoard)
    if (result.winner !== null) {
      // Game ended
      setWinResult(result)
      handleGameEnd(result)
    } else {
      // Process Chaos events if in Chaos Mode
      if (isChaos) {
        processChaosTurn(nextBoard)
      }

      // Switch turn
      const nextTurn: Player = player === 'X' ? 'O' : 'X'
      setCurrentTurn(nextTurn)
    }
  }

  // Handle Chaos events cycle
  const processChaosTurn = (nextBoard: Board) => {
    const emptyCells = getAvailableMoves(nextBoard)

    // Clear previous frozen cell duration (1 turn expiration)
    let nextFrozen: number | null = null
    let nextSurge: number | null = null
    let nextAnnouncement: string | null = null

    // Trigger chaos event every 2 moves when at least 2 empty cells remain
    if (moveCountRef.current % 2 === 0 && emptyCells.length >= 2) {
      const eventTypes: ('frozen' | 'power_surge' | 'grid_glitch')[] = [
        'frozen',
        'power_surge',
        'grid_glitch',
      ]
      const chosenEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]

      if (chosenEvent === 'frozen') {
        const randIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        nextFrozen = randIndex
        nextAnnouncement = `❄️ ICE LOCK: Cell ${randIndex + 1} is Frozen for 1 turn!`
        soundFx.playFreeze(soundEnabled)
      } else if (chosenEvent === 'power_surge') {
        const randIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)]
        nextSurge = randIndex
        nextAnnouncement = `⚡ POWER SURGE: Cell ${randIndex + 1} is Electrified!`
        soundFx.playSurge(soundEnabled)
      } else if (chosenEvent === 'grid_glitch') {
        setChaosState((prev) => ({
          ...prev,
          glitchActive: true,
          announcement: '🌀 GRID GLITCH DETECTED — REALITY WARPING!',
        }))
        soundFx.playGlitch(soundEnabled)
        setTimeout(() => {
          setChaosState((prev) => ({ ...prev, glitchActive: false }))
        }, 700)
        return
      }

      setChaosState({
        activeEvent: chosenEvent,
        frozenCell: nextFrozen,
        surgeCell: nextSurge,
        glitchActive: false,
        announcement: nextAnnouncement,
      })
    } else {
      // Keep any active surge or clear
      setChaosState((prev) => ({
        ...prev,
        frozenCell: null, // Frozen cell expires after 1 turn
        announcement: null,
      }))
    }
  }

  // Handle Game End (update scores, sounds, and progression)
  const handleGameEnd = (result: WinResult) => {
    if (hasReportedRoundRef.current) return
    hasReportedRoundRef.current = true

    if (result.winner === 'Draw') {
      soundFx.playDraw(soundEnabled)
      onUpdateScores({ ...scores, draws: scores.draws + 1 })
      onMatchComplete('Draw')
    } else {
      soundFx.playCinematicWin(soundEnabled)
      if (result.winner === 'X') {
        onUpdateScores({ ...scores, xWins: scores.xWins + 1 })
        onMatchComplete('X')
      } else if (result.winner === 'O') {
        onUpdateScores({ ...scores, oWins: scores.oWins + 1 })
        onMatchComplete('O')
      }
    }
  }

  // Trigger AI move when it is AI's turn
  useEffect(() => {
    if (
      isAiOpponent &&
      currentTurn === 'O' &&
      !isGameOver &&
      !isAiThinking
    ) {
      setIsAiThinking(true)

      // Natural delay (450ms) to feel like a real cyber opponent
      const timer = setTimeout(() => {
        // In chaos mode, AI avoids any cell that is currently frozen
        const aiMoveIndex = getAIMove(board, config.difficulty, isChaos ? chaosState.frozenCell : null)
        if (aiMoveIndex !== -1 && board[aiMoveIndex] === null) {
          makeMove(aiMoveIndex, 'O')
        }
        setIsAiThinking(false)
      }, 480)

      return () => clearTimeout(timer)
    }
  }, [currentTurn, board, isAiOpponent, config.difficulty, isGameOver, isChaos, chaosState.frozenCell])

  // Rematch / Next Round
  const handleRematch = () => {
    soundFx.playClick(soundEnabled)
    setBoard(Array(9).fill(null))
    setCurrentTurn('X')
    setWinResult({ winner: null, line: null })
    setIsAiThinking(false)
    hasReportedRoundRef.current = false
    moveCountRef.current = 0
    setChaosState({
      activeEvent: null,
      frozenCell: null,
      surgeCell: null,
      glitchActive: false,
      announcement: null,
    })
  }

  // Reset Match Scores and Board
  const handleResetMatch = () => {
    soundFx.playClick(soundEnabled)
    onUpdateScores({ xWins: 0, oWins: 0, draws: 0 })
    handleRematch()
  }

  return (
    <div className={`arena-game-screen ${chaosState.glitchActive ? 'board-glitching' : ''}`}>
      {/* Top HUD Bar */}
      <header className="game-hud">
        <button
          id="hud-back-btn"
          className="btn-hud-nav"
          onClick={() => {
            soundFx.playClick(soundEnabled)
            onReturnToMenu()
          }}
          aria-label="Return to Main Menu"
        >
          <svg className="hud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>MENU</span>
        </button>

        <div className="match-mode-pill">
          {isChaos ? (
            <span className="mode-tag chaos-mode-badge">
              <span className="badge-spark">⚡</span> CHAOS ARENA ACTIVE
            </span>
          ) : (
            <span className="mode-tag">
              {config.mode === 'ai' ? `VS AI • ${config.difficulty.toUpperCase()}` : 'PASS & PLAY'}
            </span>
          )}
        </div>

        <button
          id="hud-reset-scores-btn"
          className="btn-hud-reset"
          onClick={handleResetMatch}
          title="Reset match scores to zero"
        >
          Reset Scores
        </button>
      </header>

      {/* Scoreboard */}
      <section className="scoreboard-container" aria-label="Current Match Scores">
        <div className={`score-card score-player-x ${currentTurn === 'X' && !isGameOver ? 'active-player' : ''}`}>
          <div className="player-meta">
            <span className="player-symbol x-glow">X</span>
            <span className="player-name">{config.playerXName}</span>
          </div>
          <div className="score-number">{scores.xWins}</div>
        </div>

        <div className="score-divider">
          <span className="draw-count">{scores.draws}</span>
          <span className="draw-label">DRAWS</span>
        </div>

        <div className={`score-card score-player-o ${currentTurn === 'O' && !isGameOver ? 'active-player' : ''}`}>
          <div className="player-meta">
            <span className="player-symbol o-glow">O</span>
            <span className="player-name">{config.playerOName}</span>
          </div>
          <div className="score-number">{scores.oWins}</div>
        </div>
      </section>

      {/* Chaos Announcement Banner */}
      {isChaos && chaosState.announcement && (
        <div className="chaos-announcement-banner" role="alert">
          <span className="announcement-text">{chaosState.announcement}</span>
        </div>
      )}

      {/* Turn & Status Indicator */}
      <div className="turn-indicator-box">
        {isGameOver ? (
          <div className="status-announcement">
            {winResult.winner === 'Draw' ? (
              <span className="announcement-draw">⚔️ MATCH TIED — STALEMATE</span>
            ) : (
              <span className="announcement-win">
                🏆 {winResult.winner === 'X' ? config.playerXName : config.playerOName} WINS!
              </span>
            )}
          </div>
        ) : isAiThinking ? (
          <div className="ai-thinking-indicator">
            <span className="thinking-pulse"></span>
            <span>AI Opponent is calculating move...</span>
          </div>
        ) : (
          <div className="active-turn-indicator">
            <span className={`turn-dot ${currentTurn === 'X' ? 'dot-cyan' : 'dot-purple'}`}></span>
            <span>
              Turn: <strong>{currentTurn === 'X' ? config.playerXName : config.playerOName}</strong>
              <span className="turn-symbol-badge">({currentTurn})</span>
            </span>
          </div>
        )}
      </div>

      {/* 3x3 Arena Grid */}
      <main className="game-board-wrapper">
        <div className="board-backdrop-glow"></div>
        <div className="board-grid" role="grid" aria-label="XO Arena 3 by 3 Board">
          {board.map((cell, idx) => {
            const isWinningCell = winResult.line?.includes(idx)
            const isFrozen = isChaos && chaosState.frozenCell === idx
            const isSurge = isChaos && chaosState.surgeCell === idx

            return (
              <button
                key={idx}
                id={`arena-cell-${idx}`}
                className={`arena-cell ${
                  cell ? `filled cell-${cell.toLowerCase()}` : 'empty'
                } ${isWinningCell ? 'winning-cell' : ''} ${isFrozen ? 'cell-frozen' : ''} ${
                  isSurge ? 'cell-surge' : ''
                }`}
                onClick={() => handleCellClick(idx)}
                disabled={Boolean(cell || isGameOver || isAiThinking || isFrozen)}
                aria-label={`Row ${Math.floor(idx / 3) + 1}, Column ${(idx % 3) + 1}: ${
                  cell || (isFrozen ? 'Frozen' : isSurge ? 'Power Surged' : 'Empty')
                }`}
              >
                {cell ? (
                  <span className="placed-symbol">{cell}</span>
                ) : isFrozen ? (
                  <div className="frozen-overlay">
                    <span className="frozen-icon">❄️</span>
                    <span className="frozen-timer">LOCKED</span>
                  </div>
                ) : isSurge ? (
                  <div className="surge-overlay">
                    <span className="surge-icon">⚡</span>
                    <span className="surge-tag">SURGE</span>
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </main>

      {/* Match Controls & End of Match Actions */}
      <div className="game-actions-group">
        {!isGameOver && (
          <button
            id="new-round-btn"
            className="btn-secondary small-btn"
            onClick={handleRematch}
          >
            Restart Round ↺
          </button>
        )}
      </div>

      {/* Cinematic Victory Overlay & Particle Confetti */}
      {isGameOver && (
        <CinematicVictory
          winResult={winResult}
          playerXName={config.playerXName}
          playerOName={config.playerOName}
          isChaos={isChaos}
          onRematch={handleRematch}
          onReturnToMenu={onReturnToMenu}
        />
      )}
    </div>
  )
}
