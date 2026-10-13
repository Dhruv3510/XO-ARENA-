import { useEffect, useRef } from 'react'
import type { WinResult } from '../types/game'

interface CinematicVictoryProps {
  winResult: WinResult
  playerXName: string
  playerOName: string
  isChaos: boolean
  onRematch: () => void
  onReturnToMenu: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  decay: number
  rotation: number
  vRot: number
}

const NEON_PALETTE = ['#00f2fe', '#a855f7', '#ec4899', '#facc15', '#38bdf8', '#c084fc']

export function CinematicVictory({
  winResult,
  playerXName,
  playerOName,
  isChaos,
  onRematch,
  onReturnToMenu,
}: CinematicVictoryProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isWinner = winResult.winner === 'X' || winResult.winner === 'O'

  // Canvas particle explosion on victory
  useEffect(() => {
    if (!isWinner) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const particles: Particle[] = []
    const particleCount = 90

    // Spawn burst from center
    const originX = width / 2
    const originY = height * 0.45

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 8 + 3
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // slight upward bias
        size: Math.random() * 6 + 3,
        color: NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.008,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.14 // gravity
        p.vx *= 0.985 // drag
        p.alpha -= p.decay
        p.rotation += p.vRot

        if (p.alpha <= 0) continue

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 10
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5)
        ctx.restore()
      }

      const activeParticles = particles.filter((p) => p.alpha > 0)
      if (activeParticles.length > 0) {
        animationId = requestAnimationFrame(render)
      }
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [isWinner])

  const winnerName = winResult.winner === 'X' ? playerXName : playerOName

  return (
    <div className="cinematic-victory-overlay" role="dialog" aria-modal="true">
      {/* Background Shockwave flash */}
      <div className="victory-shockwave" aria-hidden="true"></div>

      {/* Confetti canvas */}
      {isWinner && <canvas ref={canvasRef} className="victory-confetti-canvas" />}

      {/* Main Victory Card */}
      <div className="cinematic-card">
        <div className="cinematic-badge">
          {isChaos && isWinner ? (
            <span className="badge-chaos-glow">⚡ CHAOS CONQUEROR</span>
          ) : isWinner ? (
            <span className="badge-victory-glow">👑 ARENA CHAMPION</span>
          ) : (
            <span className="badge-draw-glow">⚔️ MATCH TIED</span>
          )}
        </div>

        <h2 className="cinematic-title">
          {isWinner ? (
            <>
              VICTORY FOR <span className="winner-highlight">{winnerName}</span>!
            </>
          ) : (
            <>TACTICAL STALEMATE</>
          )}
        </h2>

        <p className="cinematic-subtitle">
          {isWinner
            ? isChaos
              ? 'Tumphed through chaos hazards and claimed the ultimate glory!'
              : 'Outmaneuvered the rival and conquered the 3x3 arena!'
            : 'Both duelists fought with equal precision. No territory conceded.'}
        </p>

        {/* XP Gains Tag */}
        <div className="victory-xp-reward">
          <span className="xp-star">⭐</span>
          <span className="xp-amount">
            {isWinner ? (isChaos ? '+95 XP EARNED' : '+70 XP EARNED') : '+35 XP EARNED'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="cinematic-actions">
          <button
            id="cinematic-rematch-btn"
            className="btn-play-now"
            onClick={onRematch}
            autoFocus
          >
            <span className="btn-content">
              <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              PLAY AGAIN (REMATCH)
            </span>
          </button>

          <button
            id="cinematic-menu-btn"
            className="btn-secondary"
            onClick={onReturnToMenu}
          >
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  )
}
