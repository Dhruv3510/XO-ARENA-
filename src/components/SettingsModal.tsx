import type { ProgressionData, ThemeId } from '../types/game'
import { isThemeUnlocked } from '../utils/progression'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  progression: ProgressionData
  onToggleSound: () => void
  onSelectTheme: (theme: ThemeId) => void
  onResetData: () => void
  onPlayClickSound: () => void
}

const THEME_OPTIONS: { id: ThemeId; name: string; preview: string; unlockRequirement: string }[] = [
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    preview: 'linear-gradient(135deg, #00f2fe, #a855f7)',
    unlockRequirement: 'Default Theme',
  },
  {
    id: 'electric-emerald',
    name: 'Electric Emerald',
    preview: 'linear-gradient(135deg, #10b981, #06b6d4)',
    unlockRequirement: 'Unlocks at Level 2',
  },
  {
    id: 'crimson-horizon',
    name: 'Crimson Horizon',
    preview: 'linear-gradient(135deg, #f43f5e, #f97316)',
    unlockRequirement: 'Unlocks at Level 3',
  },
  {
    id: 'solar-gold',
    name: 'Solar Gold',
    preview: 'linear-gradient(135deg, #eab308, #fbbf24)',
    unlockRequirement: 'Unlocks at Level 4',
  },
]

export function SettingsModal({
  isOpen,
  onClose,
  progression,
  onToggleSound,
  onSelectTheme,
  onResetData,
  onPlayClickSound,
}: SettingsModalProps) {
  if (!isOpen) return null

  const handleReset = () => {
    onPlayClickSound()
    if (window.confirm('Are you sure you want to reset your saved stats, XP, and achievements? This cannot be undone.')) {
      onResetData()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box settings-modal-box"
        role="dialog"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-badge">ARENA SETTINGS</span>
          <button
            id="close-settings-btn"
            className="btn-close"
            onClick={() => {
              onPlayClickSound()
              onClose()
            }}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="settings-content">
          {/* Audio Controls */}
          <section className="settings-section">
            <h3 className="section-title">Sound Effects</h3>
            <div className="setting-toggle-row">
              <div className="toggle-info">
                <span className="toggle-label">Arcade Synthesizer Audio</span>
                <span className="toggle-desc">Sound effects for moves, victories, and interactions</span>
              </div>
              <button
                type="button"
                id="toggle-sound-btn"
                className={`switch-btn ${progression.soundEnabled ? 'switch-on' : 'switch-off'}`}
                onClick={() => {
                  onPlayClickSound()
                  onToggleSound()
                }}
                aria-pressed={progression.soundEnabled}
              >
                <span className="switch-thumb"></span>
                <span className="switch-text">{progression.soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </section>

          {/* Theme Selection */}
          <section className="settings-section">
            <h3 className="section-title">Visual Board Theme</h3>
            <div className="themes-grid">
              {THEME_OPTIONS.map((theme) => {
                const unlocked = isThemeUnlocked(theme.id, progression)
                const isSelected = progression.selectedTheme === theme.id

                return (
                  <button
                    key={theme.id}
                    id={`theme-btn-${theme.id}`}
                    type="button"
                    disabled={!unlocked}
                    className={`theme-card ${isSelected ? 'theme-active' : ''} ${!unlocked ? 'theme-locked' : ''}`}
                    onClick={() => {
                      if (unlocked) {
                        onPlayClickSound()
                        onSelectTheme(theme.id)
                      }
                    }}
                  >
                    <div className="theme-color-preview" style={{ background: theme.preview }}></div>
                    <div className="theme-card-info">
                      <span className="theme-name">{theme.name}</span>
                      <span className="theme-status">
                        {isSelected ? '✓ ACTIVE' : unlocked ? 'READY' : `🔒 ${theme.unlockRequirement}`}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Data Reset */}
          <section className="settings-section danger-zone">
            <h3 className="section-title">Storage & Profile Data</h3>
            <p className="danger-text">Reset all offline XP, win streaks, and achievement badges stored in your browser.</p>
            <button
              type="button"
              id="reset-storage-btn"
              className="btn-danger"
              onClick={handleReset}
            >
              Reset Saved Progress
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
