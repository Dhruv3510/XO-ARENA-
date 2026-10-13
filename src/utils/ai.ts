import type { Board, Difficulty, WinResult } from '../types/game'

// Standard 3x3 Tic-Tac-Toe winning lines (3 horizontal, 3 vertical, 2 diagonal)
export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Main diagonal
  [2, 4, 6], // Anti diagonal
]

/**
 * Checks whether the current board has a winner or is a draw.
 * Returns the winning player ('X' or 'O'), or 'Draw', along with the winning cell indices.
 */
export function checkWinner(board: Board): WinResult {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo }
    }
  }

  // If there are still empty cells, game continues
  if (board.includes(null)) {
    return { winner: null, line: null }
  }

  // All cells filled with no winner means it is a draw
  return { winner: 'Draw', line: null }
}

/**
 * Returns an array of empty cell indices on the board (0 through 8).
 */
export function getAvailableMoves(board: Board): number[] {
  const moves: number[] = []
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i)
    }
  }
  return moves
}

/**
 * MINIMAX ALGORITHM IMPLEMENTATION
 *
 * The Minimax algorithm is a decision rule used in two-player, zero-sum turn-based games.
 *
 * 1. Base Cases:
 *    - If AI ('O') wins: Score is +10 (subtracted by depth to prefer faster wins).
 *    - If Human ('X') wins: Score is -10 (added by depth to delay inevitable losses).
 *    - If Draw: Score is 0.
 *
 * 2. Recursive Step:
 *    - When it is AI's turn (Maximizing player):
 *      We test every possible move, calculate its outcome recursively,
 *      and choose the move that produces the HIGHEST score.
 *    - When it is Human's turn (Minimizing player):
 *      We assume the human makes the best counter-move,
 *      and choose the move that produces the LOWEST score for AI.
 *
 * Because Tic-Tac-Toe has a small state space (maximum 9 moves),
 * this minimax search guarantees the AI will NEVER lose under any circumstance.
 */
function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean
): { score: number; bestMove?: number } {
  const result = checkWinner(board)

  // Terminal state evaluations:
  if (result.winner === 'O') {
    return { score: 10 - depth } // AI wins
  }
  if (result.winner === 'X') {
    return { score: depth - 10 } // Human wins
  }
  if (result.winner === 'Draw') {
    return { score: 0 } // Draw
  }

  const availableMoves = getAvailableMoves(board)

  if (isMaximizing) {
    // AI's turn: maximize the score
    let bestScore = -Infinity
    let bestMove = availableMoves[0]

    for (const move of availableMoves) {
      // Simulate placing AI move
      board[move] = 'O'
      const evaluation = minimax(board, depth + 1, false)
      // Backtrack
      board[move] = null

      if (evaluation.score > bestScore) {
        bestScore = evaluation.score
        bestMove = move
      }
    }

    return { score: bestScore, bestMove }
  } else {
    // Human's turn: minimize the score
    let bestScore = Infinity
    let bestMove = availableMoves[0]

    for (const move of availableMoves) {
      // Simulate placing Human move
      board[move] = 'X'
      const evaluation = minimax(board, depth + 1, true)
      // Backtrack
      board[move] = null

      if (evaluation.score < bestScore) {
        bestScore = evaluation.score
        bestMove = move
      }
    }

    return { score: bestScore, bestMove }
  }
}

/**
 * Determines the AI's move according to the selected difficulty level.
 * - Easy: Completely random legal move.
 * - Medium: Smart heuristics (takes winning move, blocks human win, takes center, otherwise random).
 * - Impossible: Flawless Minimax (guaranteed to never lose).
 */
export function getAIMove(board: Board, difficulty: Difficulty, blockedCell?: number | null): number {
  let availableMoves = getAvailableMoves(board)
  if (blockedCell !== undefined && blockedCell !== null) {
    availableMoves = availableMoves.filter((m) => m !== blockedCell)
  }
  if (availableMoves.length === 0) return -1

  // If entire board is empty and AI goes first, taking center or corner is optimal
  if (availableMoves.length === 9) {
    const openings = [0, 2, 4, 6, 8]
    return openings[Math.floor(Math.random() * openings.length)]
  }

  // --- EASY DIFFICULTY ---
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length)
    return availableMoves[randomIndex]
  }

  // --- MEDIUM DIFFICULTY ---
  if (difficulty === 'medium') {
    // 1. Can AI win in one move?
    for (const move of availableMoves) {
      board[move] = 'O'
      const winCheck = checkWinner(board)
      board[move] = null
      if (winCheck.winner === 'O') {
        return move
      }
    }

    // 2. Can Human win in one move? Block them!
    for (const move of availableMoves) {
      board[move] = 'X'
      const blockCheck = checkWinner(board)
      board[move] = null
      if (blockCheck.winner === 'X') {
        return move
      }
    }

    // 3. Prefer center if open
    if (board[4] === null && Math.random() < 0.7) {
      return 4
    }

    // 4. Otherwise, choose a random move 60% of the time, or a corner
    const corners = [0, 2, 6, 8].filter((c) => board[c] === null)
    if (corners.length > 0 && Math.random() < 0.6) {
      return corners[Math.floor(Math.random() * corners.length)]
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  // --- IMPOSSIBLE DIFFICULTY (MINIMAX) ---
  const boardCopy = [...board]
  const result = minimax(boardCopy, 0, true)
  return result.bestMove !== undefined ? result.bestMove : availableMoves[0]
}
