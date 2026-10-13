import type { Achievement, DailyChallenge, ProgressionData, ThemeId } from '../types/game'

const STORAGE_KEY = 'xo_arena_progression_v1'

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Claim your very first victory in the arena.',
    icon: '⚔️',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'win_streak_3',
    title: 'Triple Threat',
    description: 'Achieve a winning streak of 3 consecutive matches.',
    icon: '🔥',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ten_wins',
    title: 'Deca Gladiator',
    description: 'Win a total of 10 matches in XO Arena.',
    icon: '👑',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'beat_impossible',
    title: 'Minimax Slayer',
    description: 'Outsmart the Impossible AI difficulty.',
    icon: '🤖',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'reach_level_3',
    title: 'Rising Champion',
    description: 'Climb the ranks and reach Player Level 3.',
    icon: '⭐',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'chaos_master',
    title: 'Chaos Survivor',
    description: 'Triumph over unpredictability and win a Chaos Mode match.',
    icon: '⚡',
    unlocked: false,
    unlockedAt: null,
  },
]

function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function createDefaultDailyChallenge(): DailyChallenge {
  return {
    date: getTodayString(),
    targetWins: 2,
    progress: 0,
    completed: false,
    xpReward: 120,
  }
}

export function calculateLevel(xp: number): number {
  // Level progression curve: 0-99 XP = Level 1, 100-249 = Level 2, 250-449 = Level 3, etc.
  return Math.max(1, Math.floor(Math.sqrt(xp / 35)) + 1)
}

export function getXpForNextLevel(level: number): { currentLevelBase: number; nextLevelTarget: number } {
  // Invert level formula to calculate XP thresholds
  const currentLevelBase = Math.pow(level - 1, 2) * 35
  const nextLevelTarget = Math.pow(level, 2) * 35
  return { currentLevelBase, nextLevelTarget }
}

export function loadProgression(): ProgressionData {
  if (typeof window === 'undefined') {
    return {
      xp: 0,
      level: 1,
      matchesPlayed: 0,
      totalWins: 0,
      totalDraws: 0,
      totalLosses: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
      dailyChallenge: createDefaultDailyChallenge(),
      selectedTheme: 'cyber-neon',
      soundEnabled: true,
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        xp: 0,
        level: 1,
        matchesPlayed: 0,
        totalWins: 0,
        totalDraws: 0,
        totalLosses: 0,
        currentStreak: 0,
        bestStreak: 0,
        achievements: DEFAULT_ACHIEVEMENTS,
        dailyChallenge: createDefaultDailyChallenge(),
        selectedTheme: 'cyber-neon',
        soundEnabled: true,
      }
    }

    const data: ProgressionData = JSON.parse(raw)
    const today = getTodayString()

    // Refresh daily challenge if date has changed
    if (!data.dailyChallenge || data.dailyChallenge.date !== today) {
      data.dailyChallenge = createDefaultDailyChallenge()
    }

    // Merge in any new achievements that might have been added
    const currentAchMap = new Map(data.achievements?.map((a) => [a.id, a]) || [])
    data.achievements = DEFAULT_ACHIEVEMENTS.map((def) => {
      const existing = currentAchMap.get(def.id)
      return existing || def
    })

    // Recalculate level
    data.level = calculateLevel(data.xp)

    return data
  } catch (err) {
    console.error('Failed to load progression from localStorage:', err)
    return {
      xp: 0,
      level: 1,
      matchesPlayed: 0,
      totalWins: 0,
      totalDraws: 0,
      totalLosses: 0,
      currentStreak: 0,
      bestStreak: 0,
      achievements: DEFAULT_ACHIEVEMENTS,
      dailyChallenge: createDefaultDailyChallenge(),
      selectedTheme: 'cyber-neon',
      soundEnabled: true,
    }
  }
}

export function saveProgression(data: ProgressionData): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save progression to localStorage:', err)
  }
}

export interface MatchOutcomeParams {
  winner: 'X' | 'O' | 'Draw'
  isAI: boolean
  difficulty?: 'easy' | 'medium' | 'impossible'
  isChaos?: boolean
}

export interface MatchRewardResult {
  updatedData: ProgressionData
  xpGained: number
  levelUp: boolean
  newAchievements: Achievement[]
  dailyCompletedNow: boolean
}

/**
 * Updates progression state based on a finished match.
 * Prevents double rewards by being called once per unique match completion.
 */
export function recordMatchResult(
  currentData: ProgressionData,
  params: MatchOutcomeParams
): MatchRewardResult {
  const data: ProgressionData = JSON.parse(JSON.stringify(currentData))
  const isHumanWin = params.winner === 'X'
  const isDraw = params.winner === 'Draw'

  // Match statistics increment
  data.matchesPlayed += 1
  let xpGained = 20 // Base XP for completing any match

  if (isHumanWin) {
    data.totalWins += 1
    data.currentStreak += 1
    if (data.currentStreak > data.bestStreak) {
      data.bestStreak = data.currentStreak
    }
    xpGained += 50 // Bonus for win

    if (params.isAI && params.difficulty === 'impossible') {
      xpGained += 50 // Major bonus for defeating Impossible AI
    }
    if (params.isChaos) {
      xpGained += 25 // Bonus for surviving and winning in Chaos mode
    }
  } else if (isDraw) {
    data.totalDraws += 1
    data.currentStreak = 0
    xpGained += 15 // Bonus for draw
  } else {
    data.totalLosses += 1
    data.currentStreak = 0
  }

  // Daily Challenge check
  let dailyCompletedNow = false
  const today = getTodayString()
  if (!data.dailyChallenge || data.dailyChallenge.date !== today) {
    data.dailyChallenge = createDefaultDailyChallenge()
  }

  if (isHumanWin && !data.dailyChallenge.completed) {
    data.dailyChallenge.progress += 1
    if (data.dailyChallenge.progress >= data.dailyChallenge.targetWins) {
      data.dailyChallenge.completed = true
      dailyCompletedNow = true
      xpGained += data.dailyChallenge.xpReward
    }
  }

  // Apply XP & check Level Up
  const previousLevel = data.level
  data.xp += xpGained
  data.level = calculateLevel(data.xp)
  const levelUp = data.level > previousLevel

  // Check Achievements
  const newAchievements: Achievement[] = []
  const nowISO = new Date().toISOString()

  data.achievements = data.achievements.map((ach) => {
    if (ach.unlocked) return ach

    let shouldUnlock = false
    if (ach.id === 'first_win' && data.totalWins >= 1) shouldUnlock = true
    if (ach.id === 'win_streak_3' && data.currentStreak >= 3) shouldUnlock = true
    if (ach.id === 'ten_wins' && data.totalWins >= 10) shouldUnlock = true
    if (ach.id === 'beat_impossible' && isHumanWin && params.isAI && params.difficulty === 'impossible') shouldUnlock = true
    if (ach.id === 'reach_level_3' && data.level >= 3) shouldUnlock = true
    if (ach.id === 'chaos_master' && isHumanWin && params.isChaos) shouldUnlock = true

    if (shouldUnlock) {
      const unlockedAch: Achievement = { ...ach, unlocked: true, unlockedAt: nowISO }
      newAchievements.push(unlockedAch)
      return unlockedAch
    }
    return ach
  })

  // Save to localStorage
  saveProgression(data)

  return {
    updatedData: data,
    xpGained,
    levelUp,
    newAchievements,
    dailyCompletedNow,
  }
}

/**
 * Checks if a given theme is unlocked based on level or stats.
 */
export function isThemeUnlocked(theme: ThemeId, data: ProgressionData): boolean {
  switch (theme) {
    case 'cyber-neon':
      return true // Default theme
    case 'electric-emerald':
      return data.level >= 2 || data.totalWins >= 2
    case 'crimson-horizon':
      return data.level >= 3 || data.totalWins >= 5
    case 'solar-gold':
      return data.level >= 4 || data.totalWins >= 10
    default:
      return true
  }
}
