import type { ProgressionData } from '../types/game'
import { getXpForNextLevel } from '../utils/progression'

interface ProgressionModalProps {
  isOpen: boolean
  onClose: () => void
  progression: ProgressionData
  onPlayClickSound: () => void
}

function getRankTitle(level: number): string {
  if (level <= 1) return 'Arena Novice'
  if (level === 2) return 'Grid Striker'
  if (level === 3) return 'Tactical Veteran'
  if (level === 4) return 'Apex Duelist'
  return 'Arena Grandmaster'
}

export function ProgressionModal({
  isOpen,
  onClose,
  progression,
  onPlayClickSound,
}: ProgressionModalProps) {
  if (!isOpen) return null

  const { currentLevelBase, nextLevelTarget } = getXpForNextLevel(progression.level)
  const xpInCurrentLevel = Math.max(0, progression.xp - currentLevelBase)
  const xpNeededForNext = Math.max(1, nextLevelTarget - currentLevelBase)
  const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))

  const winRate =
    progression.matchesPlayed > 0
      ? Math.round((progression.totalWins / progression.matchesPlayed) * 100)
      : 0

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box progression-modal-box"
        role="dialog"
        aria-labelledby="progression-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-badge">CAREER PROGRESSION</span>
          <button
            id="close-progression-btn"
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

        <div className="progression-content">
          {/* Rank & Level Banner */}
          <div className="career-rank-card">
            <div className="rank-badge">
              <span className="rank-level-number">{progression.level}</span>
              <span className="rank-level-label">LEVEL</span>
            </div>
            <div className="rank-details">
              <div className="rank-title-row">
                <span className="rank-title">{getRankTitle(progression.level)}</span>
                <span className="rank-xp-text">{progression.xp} TOTAL XP</span>
              </div>
              <div className="level-bar-track" title={`${levelProgressPct}% to next level`}>
                <div className="level-bar-fill" style={{ width: `${levelProgressPct}%` }}></div>
              </div>
              <div className="level-bar-meta">
                <span>{xpInCurrentLevel} XP</span>
                <span>{xpNeededForNext} XP to Level {progression.level + 1}</span>
              </div>
            </div>
          </div>

          {/* Player Stats Grid */}
          <div className="career-stats-grid">
            <div className="career-stat-card">
              <span className="career-stat-val">{progression.matchesPlayed}</span>
              <span className="career-stat-lbl">Matches</span>
            </div>
            <div className="career-stat-card">
              <span className="career-stat-val">{progression.totalWins}</span>
              <span className="career-stat-lbl">Victories</span>
            </div>
            <div className="career-stat-card">
              <span className="career-stat-val">{winRate}%</span>
              <span className="career-stat-lbl">Win Rate</span>
            </div>
            <div className="career-stat-card">
              <span className="career-stat-val streak-val">🔥 {progression.currentStreak}</span>
              <span className="career-stat-lbl">Streak (Best {progression.bestStreak})</span>
            </div>
          </div>

          {/* Daily Challenge Card */}
          <div className="daily-challenge-box">
            <div className="daily-header">
              <div className="daily-tag-group">
                <span className="daily-badge">DAILY QUEST</span>
                <span className="daily-date">{progression.dailyChallenge.date}</span>
              </div>
              <span className="daily-reward-tag">+{progression.dailyChallenge.xpReward} XP</span>
            </div>
            <p className="daily-desc">
              Win {progression.dailyChallenge.targetWins} arena matches today ({progression.dailyChallenge.progress} / {progression.dailyChallenge.targetWins})
            </p>
            <div className="daily-progress-track">
              <div
                className={`daily-progress-fill ${progression.dailyChallenge.completed ? 'completed' : ''}`}
                style={{
                  width: `${Math.min(
                    100,
                    (progression.dailyChallenge.progress / progression.dailyChallenge.targetWins) * 100
                  )}%`,
                }}
              ></div>
            </div>
            {progression.dailyChallenge.completed && (
              <span className="daily-status-done">✓ Completed for today!</span>
            )}
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h3 className="section-title">Achievements</h3>
            <div className="achievements-list">
              {progression.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon" aria-hidden="true">
                    {ach.icon}
                  </div>
                  <div className="achievement-info">
                    <div className="achievement-title-row">
                      <span className="achievement-title">{ach.title}</span>
                      {ach.unlocked ? (
                        <span className="ach-badge-unlocked">UNLOCKED</span>
                      ) : (
                        <span className="ach-badge-locked">LOCKED</span>
                      )}
                    </div>
                    <p className="achievement-desc">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
