import { useEffect, useState } from 'react'
import './App.css'
import { GameArena } from './components/GameArena'
import { ModeSelectModal } from './components/ModeSelectModal'
import { ProgressionModal } from './components/ProgressionModal'
import { SettingsModal } from './components/SettingsModal'
import type { GameScores, Player, PlayerConfig, ProgressionData, ThemeId } from './types/game'
import { checkWinner } from './utils/ai'
import { loadProgression, recordMatchResult, saveProgression } from './utils/progression'
import { soundFx } from './utils/sound'

type ViewMode = 'landing' | 'game'
type PreviewCell = 'X' | 'O' | null

export default function App() {
  const [view, setView] = useState<ViewMode>('landing')
  const [progression, setProgression] = useState<ProgressionData>(() => loadProgression())
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [isProgressionOpen, setIsProgressionOpen] = useState<boolean>(false)

  // Match configuration and session scores
  const [gameConfig, setGameConfig] = useState<PlayerConfig>({
    mode: 'ai',
    difficulty: 'medium',
    playerXName: 'You',
    playerOName: 'AI (Tactician)',
  })
  const [scores, setScores] = useState<GameScores>({
    xWins: 0,
    oWins: 0,
    draws: 0,
  })

  // Landing page interactive mini-preview board state
  const [previewBoard, setPreviewBoard] = useState<PreviewCell[]>(Array(9).fill(null))
  const [isPreviewXNext, setIsPreviewXNext] = useState<boolean>(true)

  // Keep HTML root dataset in sync with chosen theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', progression.selectedTheme)
  }, [progression.selectedTheme])

  // Mini-preview board calculation
  const previewWinResult = checkWinner(previewBoard)

  const handlePreviewCellClick = (idx: number) => {
    if (previewBoard[idx] || previewWinResult.winner) return
    soundFx.playMove(isPreviewXNext ? 'X' : 'O', progression.soundEnabled)
    const next = [...previewBoard]
    next[idx] = isPreviewXNext ? 'X' : 'O'
    setPreviewBoard(next)
    setIsPreviewXNext(!isPreviewXNext)
  }

  const handleResetPreview = () => {
    soundFx.playClick(progression.soundEnabled)
    setPreviewBoard(Array(9).fill(null))
    setIsPreviewXNext(true)
  }

  // Launch into match
  const handleOpenPlayNow = () => {
    soundFx.playClick(progression.soundEnabled)
    setIsModeModalOpen(true)
  }

  const handleStartGame = (config: PlayerConfig) => {
    setGameConfig(config)
    setIsModeModalOpen(false)
    setView('game')
  }

  // Handle Match Finish & Rewards
  const handleMatchComplete = (winner: Player | 'Draw') => {
    const isAiMatch =
      gameConfig.mode === 'ai' ||
      (gameConfig.mode === 'chaos' && gameConfig.chaosOpponent === 'ai')

    const outcome = recordMatchResult(progression, {
      winner,
      isAI: isAiMatch,
      difficulty: gameConfig.difficulty,
      isChaos: Boolean(gameConfig.isChaos || gameConfig.mode === 'chaos'),
    })
    setProgression(outcome.updatedData)
  }

  // Toggle Sound
  const handleToggleSound = () => {
    const updated: ProgressionData = {
      ...progression,
      soundEnabled: !progression.soundEnabled,
    }
    setProgression(updated)
    saveProgression(updated)
  }

  // Select Visual Theme
  const handleSelectTheme = (theme: ThemeId) => {
    const updated: ProgressionData = {
      ...progression,
      selectedTheme: theme,
    }
    setProgression(updated)
    saveProgression(updated)
  }

  // Reset Progress Data
  const handleResetData = () => {
    localStorage.removeItem('xo_arena_progression_v1')
    const fresh = loadProgression()
    setProgression(fresh)
    setIsSettingsOpen(false)
  }

  return (
    <div className="arena-container" data-theme={progression.selectedTheme}>
      {/* Background ambient lighting */}
      <div className="ambient-beam beam-purple" aria-hidden="true"></div>
      <div className="ambient-beam beam-cyan" aria-hidden="true"></div>

      {/* Main Header */}
      <header className="arena-header">
        <button
          className="brand"
          onClick={() => {
            soundFx.playClick(progression.soundEnabled)
            setView('landing')
          }}
          title="XO Arena Home"
        >
          <div className="brand-logo" aria-hidden="true">
            <span className="logo-x">X</span>
            <span className="logo-o">O</span>
          </div>
          <span className="brand-name">XO ARENA</span>
        </button>

        {view === 'landing' && (
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#demo" className="nav-link">Live Grid</a>
            <button
              type="button"
              className="nav-link"
              onClick={() => {
                soundFx.playClick(progression.soundEnabled)
                setIsProgressionOpen(true)
              }}
            >
              Career & Quests
            </button>
          </nav>
        )}

        <div className="header-actions">
          {/* Career Progress Pill */}
          <button
            id="header-career-btn"
            className="career-pill-btn"
            onClick={() => {
              soundFx.playClick(progression.soundEnabled)
              setIsProgressionOpen(true)
            }}
            title="View Player Level & Career Achievements"
          >
            <span className="level-badge-tag">LVL {progression.level}</span>
            <span>{progression.xp} XP</span>
          </button>

          {/* Sound Mute/Unmute quick toggle */}
          <button
            id="header-sound-btn"
            className="icon-btn-header"
            onClick={handleToggleSound}
            title={progression.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            aria-label={progression.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {progression.soundEnabled ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          {/* Settings button */}
          <button
            id="header-settings-btn"
            className="icon-btn-header"
            onClick={() => {
              soundFx.playClick(progression.soundEnabled)
              setIsSettingsOpen(true)
            }}
            title="Open Settings"
            aria-label="Open Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {/* Quick Match Launch CTA */}
          {view === 'landing' ? (
            <button
              id="nav-play-btn"
              className="btn-pill-action"
              onClick={handleOpenPlayNow}
            >
              Play Arena
            </button>
          ) : (
            <button
              id="nav-leave-btn"
              className="btn-pill-action"
              onClick={() => {
                soundFx.playClick(progression.soundEnabled)
                setView('landing')
              }}
            >
              Exit to Menu
            </button>
          )}
        </div>
      </header>

      {/* Main Body: Switch between Landing and Playable Game Screen */}
      {view === 'landing' ? (
        <main className="hero-section">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span className="badge-text">✦ PRE-SEASON ALPHA IS NOW LIVE</span>
          </div>

          <h1 id="hero-title" className="hero-title">
            XO <span className="gradient-text">ARENA</span>
          </h1>

          <p className="hero-tagline">Your Next Move Changes Everything</p>

          <p className="hero-description">
            The ultimate cybernetic battleground for tactical minds. Outwit opponents in real-time,
            master competitive rule sets, and climb the global ladder.
          </p>

          {/* Primary CTA Buttons */}
          <div className="hero-cta-group">
            <button
              id="play-now-btn"
              className="btn-play-now"
              onClick={handleOpenPlayNow}
            >
              <span className="btn-content">
                <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                PLAY NOW
              </span>
            </button>

            <a href="#demo" id="practice-mode-btn" className="btn-secondary">
              <span>TRY LIVE GRID</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Interactive Mini Demo Grid Showcase on Landing Page */}
          <section id="demo" className="interactive-showcase">
            <div className="showcase-glow-backdrop"></div>
            <div className="showcase-frame">
              <div className="showcase-header">
                <div className="grid-turn-indicator">
                  {previewWinResult.winner ? (
                    <span className="winner-announcement">
                      {previewWinResult.winner === 'Draw'
                        ? '⚔️ Grid Draw!'
                        : `🏆 Victory for ${previewWinResult.winner}!`}
                    </span>
                  ) : (
                    <span>
                      Turn:{' '}
                      <strong className={isPreviewXNext ? 'player-x' : 'player-o'}>
                        {isPreviewXNext ? 'Player X (Cyan)' : 'Player O (Purple)'}
                      </strong>
                    </span>
                  )}
                </div>
                <button
                  id="reset-grid-btn"
                  className="btn-reset"
                  onClick={handleResetPreview}
                  title="Reset Grid"
                >
                  Reset Grid ↺
                </button>
              </div>

              <div className="grid-board" role="grid" aria-label="XO Interactive Grid">
                {previewBoard.map((cell, idx) => (
                  <button
                    key={idx}
                    id={`preview-cell-${idx}`}
                    className={`grid-cell ${cell ? `cell-${cell.toLowerCase()}` : 'cell-empty'}`}
                    onClick={() => handlePreviewCellClick(idx)}
                    disabled={Boolean(cell || previewWinResult.winner)}
                    aria-label={`Cell ${idx + 1}: ${cell || 'Empty'}`}
                  >
                    {cell && <span className="cell-symbol">{cell}</span>}
                  </button>
                ))}
              </div>

              <div className="showcase-footer">
                <span className="hint-text">Interactive Demo — Click any slot to test your moves</span>
              </div>
            </div>
          </section>

          {/* Feature Cards Grid */}
          <section id="features" className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper cyan-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3 className="feature-title">Smart AI Opponent</h3>
              <p className="feature-desc">
                From casual Cadet mode to unbeatable Minimax algorithm. Test your tactical skill offline with instant response.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper purple-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="feature-title">Local Pass & Play</h3>
              <p className="feature-desc">
                Battle friends on the same screen with custom player names, live session scoreboard, and quick rematches.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper dual-glow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <h3 className="feature-title">Career Progression</h3>
              <p className="feature-desc">
                Earn XP, level up, maintain winning streaks, complete daily challenges, and unlock neon board themes.
              </p>
            </div>
          </section>
        </main>
      ) : (
        /* Real Playable Arena Game Screen */
        <GameArena
          config={gameConfig}
          scores={scores}
          onUpdateScores={setScores}
          onMatchComplete={handleMatchComplete}
          onReturnToMenu={() => setView('landing')}
          soundEnabled={progression.soundEnabled}
        />
      )}

      {/* Modals */}
      <ModeSelectModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        onStartGame={handleStartGame}
        onPlayClickSound={() => soundFx.playClick(progression.soundEnabled)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        progression={progression}
        onToggleSound={handleToggleSound}
        onSelectTheme={handleSelectTheme}
        onResetData={handleResetData}
        onPlayClickSound={() => soundFx.playClick(progression.soundEnabled)}
      />

      <ProgressionModal
        isOpen={isProgressionOpen}
        onClose={() => setIsProgressionOpen(false)}
        progression={progression}
        onPlayClickSound={() => soundFx.playClick(progression.soundEnabled)}
      />

      {/* Footer */}
      <footer className="arena-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-logo">XO ARENA</span>
            <span className="footer-version">v0.2.0 Battle Edition</span>
          </div>
          <div className="footer-right">
            <span>© {new Date().getFullYear()} XO Arena. Built with React + TypeScript + Vite.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
