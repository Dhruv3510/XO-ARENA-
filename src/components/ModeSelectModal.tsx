import { useState } from 'react'
import type { Difficulty, GameMode, PlayerConfig } from '../types/game'

interface ModeSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onStartGame: (config: PlayerConfig) => void
  onPlayClickSound: () => void
}

export function ModeSelectModal({
  isOpen,
  onClose,
  onStartGame,
  onPlayClickSound,
}: ModeSelectModalProps) {
  const [mode, setMode] = useState<GameMode>('ai')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [chaosOpponent, setChaosOpponent] = useState<'ai' | 'pvp'>('ai')
  const [playerXName, setPlayerXName] = useState<string>('Player 1')
  const [playerOName, setPlayerOName] = useState<string>('Player 2')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onPlayClickSound()

    if (mode === 'chaos') {
      onStartGame({
        mode: 'chaos',
        difficulty,
        isChaos: true,
        chaosOpponent,
        playerXName: chaosOpponent === 'ai' ? 'You' : playerXName.trim() || 'Player 1',
        playerOName:
          chaosOpponent === 'ai'
            ? `Chaos AI (${difficulty.toUpperCase()})`
            : playerOName.trim() || 'Player 2',
      })
    } else {
      onStartGame({
        mode,
        difficulty,
        isChaos: false,
        playerXName: mode === 'ai' ? 'You' : playerXName.trim() || 'Player 1',
        playerOName:
          mode === 'ai'
            ? `AI (${difficulty.toUpperCase()})`
            : playerOName.trim() || 'Player 2',
      })
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box mode-select-box"
        role="dialog"
        aria-labelledby="mode-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-badge">SELECT MATCH MODE</span>
          <button
            id="close-mode-modal-btn"
            className="btn-close"
            onClick={() => {
              onPlayClickSound()
              onClose()
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Mode Tabs */}
          <div className="mode-toggle-group three-tabs">
            <button
              type="button"
              id="mode-tab-ai"
              className={`mode-tab ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => {
                onPlayClickSound()
                setMode('ai')
              }}
            >
              <span className="tab-icon">🤖</span>
              <span>Solo AI</span>
            </button>
            <button
              type="button"
              id="mode-tab-pvp"
              className={`mode-tab ${mode === 'pvp' ? 'active' : ''}`}
              onClick={() => {
                onPlayClickSound()
                setMode('pvp')
              }}
            >
              <span className="tab-icon">👥</span>
              <span>Pass & Play</span>
            </button>
            <button
              type="button"
              id="mode-tab-chaos"
              className={`mode-tab chaos-tab ${mode === 'chaos' ? 'active' : ''}`}
              onClick={() => {
                onPlayClickSound()
                setMode('chaos')
              }}
            >
              <span className="tab-icon lightning-pulse">⚡</span>
              <span>Chaos Mode</span>
            </button>
          </div>

          {/* CHAOS MODE PROMINENT CARD & OPTIONS */}
          {mode === 'chaos' && (
            <div className="chaos-showcase-container">
              <div className="chaos-hero-card">
                <div className="chaos-card-badge">
                  <span className="spark-dot"></span>
                  <span>UNPREDICTABLE ARENA MODIFIERS</span>
                </div>
                <div className="chaos-card-header">
                  <div className="chaos-icon-box">⚡</div>
                  <div className="chaos-title-group">
                    <h3 className="chaos-card-title">CHAOS ARENA</h3>
                    <p className="chaos-card-tagline">Expect the unexpected every 2-3 moves</p>
                  </div>
                </div>
                <div className="chaos-modifiers-preview">
                  <div className="chaos-mod-pill">
                    <span className="mod-icon">❄️</span>
                    <span>Frozen Cells</span>
                  </div>
                  <div className="chaos-mod-pill">
                    <span className="mod-icon">⚡</span>
                    <span>Power Surges</span>
                  </div>
                  <div className="chaos-mod-pill">
                    <span className="mod-icon">🌀</span>
                    <span>Grid Glitches</span>
                  </div>
                </div>
              </div>

              {/* Chaos Opponent Toggle */}
              <div className="chaos-opponent-select">
                <label className="section-label">Choose Chaos Opponent</label>
                <div className="sub-toggle-group">
                  <button
                    type="button"
                    className={`sub-tab ${chaosOpponent === 'ai' ? 'sub-active' : ''}`}
                    onClick={() => {
                      onPlayClickSound()
                      setChaosOpponent('ai')
                    }}
                  >
                    Vs AI Opponent
                  </button>
                  <button
                    type="button"
                    className={`sub-tab ${chaosOpponent === 'pvp' ? 'sub-active' : ''}`}
                    onClick={() => {
                      onPlayClickSound()
                      setChaosOpponent('pvp')
                    }}
                  >
                    Pass & Play (2P)
                  </button>
                </div>
              </div>

              {/* AI Difficulty if Chaos vs AI */}
              {chaosOpponent === 'ai' && (
                <div className="difficulty-section">
                  <label className="section-label">AI Difficulty Level</label>
                  <div className="difficulty-cards compact">
                    <button
                      type="button"
                      className={`diff-card ${difficulty === 'easy' ? 'selected' : ''}`}
                      onClick={() => {
                        onPlayClickSound()
                        setDifficulty('easy')
                      }}
                    >
                      <div className="diff-header">
                        <span className="diff-title">Cadet</span>
                        <span className="diff-badge green">Easy</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`diff-card ${difficulty === 'medium' ? 'selected' : ''}`}
                      onClick={() => {
                        onPlayClickSound()
                        setDifficulty('medium')
                      }}
                    >
                      <div className="diff-header">
                        <span className="diff-title">Tactician</span>
                        <span className="diff-badge purple">Medium</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={`diff-card ${difficulty === 'impossible' ? 'selected' : ''}`}
                      onClick={() => {
                        onPlayClickSound()
                        setDifficulty('impossible')
                      }}
                    >
                      <div className="diff-header">
                        <span className="diff-title">Grandmaster</span>
                        <span className="diff-badge cyan">Impossible</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Names if Chaos Pass & Play */}
              {chaosOpponent === 'pvp' && (
                <div className="pvp-names-section">
                  <div className="input-group">
                    <div className="input-row">
                      <span className="symbol-tag x-tag">X</span>
                      <input
                        type="text"
                        maxLength={14}
                        value={playerXName}
                        onChange={(e) => setPlayerXName(e.target.value)}
                        placeholder="Player 1 Name"
                        className="name-input"
                      />
                    </div>
                    <div className="input-row">
                      <span className="symbol-tag o-tag">O</span>
                      <input
                        type="text"
                        maxLength={14}
                        value={playerOName}
                        onChange={(e) => setPlayerOName(e.target.value)}
                        placeholder="Player 2 Name"
                        className="name-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STANDARD SOLO VS AI SELECTION */}
          {mode === 'ai' && (
            <div className="difficulty-section">
              <label className="section-label">AI Difficulty</label>
              <div className="difficulty-cards">
                <button
                  type="button"
                  id="diff-easy-btn"
                  className={`diff-card ${difficulty === 'easy' ? 'selected' : ''}`}
                  onClick={() => {
                    onPlayClickSound()
                    setDifficulty('easy')
                  }}
                >
                  <div className="diff-header">
                    <span className="diff-title">Cadet</span>
                    <span className="diff-badge green">Easy</span>
                  </div>
                  <p className="diff-desc">Makes casual and random moves. Great for beginners.</p>
                </button>

                <button
                  type="button"
                  id="diff-med-btn"
                  className={`diff-card ${difficulty === 'medium' ? 'selected' : ''}`}
                  onClick={() => {
                    onPlayClickSound()
                    setDifficulty('medium')
                  }}
                >
                  <div className="diff-header">
                    <span className="diff-title">Tactician</span>
                    <span className="diff-badge purple">Medium</span>
                  </div>
                  <p className="diff-desc">Blocks lines and exploits openings with smart tactics.</p>
                </button>

                <button
                  type="button"
                  id="diff-hard-btn"
                  className={`diff-card ${difficulty === 'impossible' ? 'selected' : ''}`}
                  onClick={() => {
                    onPlayClickSound()
                    setDifficulty('impossible')
                  }}
                >
                  <div className="diff-header">
                    <span className="diff-title">Grandmaster</span>
                    <span className="diff-badge cyan">Impossible</span>
                  </div>
                  <p className="diff-desc">Powered by pure Minimax. Mathematically unbeatable.</p>
                </button>
              </div>
            </div>
          )}

          {/* STANDARD 2-PLAYER SELECTION */}
          {mode === 'pvp' && (
            <div className="pvp-names-section">
              <label className="section-label">Player Names</label>
              <div className="input-group">
                <div className="input-row">
                  <span className="symbol-tag x-tag">X</span>
                  <input
                    id="player-x-input"
                    type="text"
                    maxLength={14}
                    value={playerXName}
                    onChange={(e) => setPlayerXName(e.target.value)}
                    placeholder="Player 1 Name"
                    className="name-input"
                  />
                </div>
                <div className="input-row">
                  <span className="symbol-tag o-tag">O</span>
                  <input
                    id="player-o-input"
                    type="text"
                    maxLength={14}
                    value={playerOName}
                    onChange={(e) => setPlayerOName(e.target.value)}
                    placeholder="Player 2 Name"
                    className="name-input"
                  />
                </div>
              </div>
              <p className="pvp-hint">Take turns playing on the same device.</p>
            </div>
          )}

          <div className="modal-footer action-footer">
            <button
              type="submit"
              id="start-arena-btn"
              className={`btn-play-now full-width ${mode === 'chaos' ? 'btn-chaos-launch' : ''}`}
            >
              <span className="btn-content">
                <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {mode === 'chaos' ? 'ENTER CHAOS ARENA ⚡' : 'ENTER ARENA'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
