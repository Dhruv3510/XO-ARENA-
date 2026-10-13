export type Cell = 'X' | 'O' | null
export type Board = Cell[]
export type Player = 'X' | 'O'

export type GameMode = 'ai' | 'pvp' | 'chaos'
export type Difficulty = 'easy' | 'medium' | 'impossible'
export type GameStatus = 'in_progress' | 'won' | 'draw'

export type ThemeId = 'cyber-neon' | 'electric-emerald' | 'crimson-horizon' | 'solar-gold'

export type ChaosEventType = 'frozen' | 'power_surge' | 'grid_glitch' | null

export interface ChaosState {
  activeEvent: ChaosEventType
  frozenCell: number | null
  surgeCell: number | null
  glitchActive: boolean
  announcement: string | null
}

export interface WinResult {
  winner: Player | 'Draw' | null
  line: number[] | null
}

export interface PlayerConfig {
  mode: GameMode
  difficulty: Difficulty
  playerXName: string
  playerOName: string
  isChaos?: boolean
  chaosOpponent?: 'ai' | 'pvp'
}

export interface GameScores {
  xWins: number
  oWins: number
  draws: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

export interface DailyChallenge {
  date: string // YYYY-MM-DD
  targetWins: number
  progress: number
  completed: boolean
  xpReward: number
}

export interface ProgressionData {
  xp: number
  level: number
  matchesPlayed: number
  totalWins: number
  totalDraws: number
  totalLosses: number
  currentStreak: number
  bestStreak: number
  achievements: Achievement[]
  dailyChallenge: DailyChallenge
  selectedTheme: ThemeId
  soundEnabled: boolean
}
