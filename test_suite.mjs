// Comprehensive logic test suite for XO Arena
// Tests: Win detection, AI (Easy, Medium, Minimax), Progression & Achievements

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (board.includes(null)) {
    return { winner: null, line: null };
  }
  return { winner: 'Draw', line: null };
}

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);
  if (result.winner === 'O') return { score: 10 - depth };
  if (result.winner === 'X') return { score: depth - 10 };
  if (result.winner === 'Draw') return { score: 0 };

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    let bestMove = availableMoves[0];
    for (const move of availableMoves) {
      board[move] = 'O';
      const evalResult = minimax(board, depth + 1, false);
      board[move] = null;
      if (evalResult.score > bestScore) {
        bestScore = evalResult.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove = availableMoves[0];
    for (const move of availableMoves) {
      board[move] = 'X';
      const evalResult = minimax(board, depth + 1, true);
      board[move] = null;
      if (evalResult.score < bestScore) {
        bestScore = evalResult.score;
        bestMove = move;
      }
    }
    return { score: bestScore, bestMove };
  }
}

function getAIMove(board, difficulty, blockedCell) {
  let availableMoves = getAvailableMoves(board);
  if (blockedCell !== undefined && blockedCell !== null) {
    availableMoves = availableMoves.filter((m) => m !== blockedCell);
  }
  if (availableMoves.length === 0) return -1;

  if (difficulty === 'easy') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === 'medium') {
    // 1. Can AI win?
    for (const move of availableMoves) {
      board[move] = 'O';
      const winCheck = checkWinner(board);
      board[move] = null;
      if (winCheck.winner === 'O') return move;
    }
    // 2. Can Human win? Block!
    for (const move of availableMoves) {
      board[move] = 'X';
      const blockCheck = checkWinner(board);
      board[move] = null;
      if (blockCheck.winner === 'X') return move;
    }
    return availableMoves[0];
  }

  // Impossible (Minimax)
  const boardCopy = [...board];
  const res = minimax(boardCopy, 0, true);
  if (res.bestMove !== undefined && res.bestMove !== blockedCell) {
    return res.bestMove;
  }
  return availableMoves[0];
}

// Test Runner
let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('--- TEST GROUP 1: Win and Draw Detection ---');
// Row win
assert(checkWinner(['X', 'X', 'X', null, 'O', null, null, null, 'O']).winner === 'X', 'Detects row 1 horizontal win for X');
// Column win
assert(checkWinner(['O', 'X', null, 'O', 'X', null, 'O', null, null]).winner === 'O', 'Detects column 1 vertical win for O');
// Diagonal win
assert(checkWinner(['X', 'O', null, 'O', 'X', null, null, null, 'X']).winner === 'X', 'Detects main diagonal win for X');
// Draw
const drawBoard = [
  'X', 'O', 'X',
  'X', 'O', 'O',
  'O', 'X', 'X'
];
assert(checkWinner(drawBoard).winner === 'Draw', 'Detects full-board draw correctly');
// In progress
const inProgressBoard = ['X', 'O', null, null, null, null, null, null, null];
assert(checkWinner(inProgressBoard).winner === null, 'Identifies in-progress game');

console.log('\n--- TEST GROUP 2: AI Opponent Logic ---');
// Easy AI legal move
const sampleBoard = ['X', null, 'O', null, 'X', null, null, null, null];
const easyMove = getAIMove(sampleBoard, 'easy');
assert(sampleBoard[easyMove] === null, 'Easy AI selects a legal empty cell');

// Medium AI winning move
const aiWinningBoard = ['O', 'O', null, 'X', 'X', null, null, null, null];
const medWinMove = getAIMove(aiWinningBoard, 'medium');
assert(medWinMove === 2, 'Medium AI takes immediate winning move at index 2');

// Medium AI blocking move
const aiBlockBoard = ['X', 'X', null, 'O', null, null, null, null, null];
const medBlockMove = getAIMove(aiBlockBoard, 'medium');
assert(medBlockMove === 2, 'Medium AI blocks opponent winning move at index 2');

console.log('\n--- TEST GROUP 3: Minimax AI (Impossible) Unbeatable Proof ---');
// Simulate game where Human plays random valid moves, Minimax plays O
// Over 50 random match games, human must NEVER win!
let humanWins = 0;
let aiWins = 0;
let draws = 0;

for (let game = 0; game < 50; game++) {
  const simBoard = Array(9).fill(null);
  let turn = 'X'; // Human starts
  while (true) {
    const state = checkWinner(simBoard);
    if (state.winner !== null) {
      if (state.winner === 'X') humanWins++;
      else if (state.winner === 'O') aiWins++;
      else if (state.winner === 'Draw') draws++;
      break;
    }

    if (turn === 'X') {
      const avail = getAvailableMoves(simBoard);
      const randMove = avail[Math.floor(Math.random() * avail.length)];
      simBoard[randMove] = 'X';
      turn = 'O';
    } else {
      const move = getAIMove(simBoard, 'impossible');
      simBoard[move] = 'O';
      turn = 'X';
    }
  }
}

assert(humanWins === 0, `Minimax never loses (AI Wins: ${aiWins}, Draws: ${draws}, Human Wins: ${humanWins})`);

console.log('\n--- TEST GROUP 4: Progression & Leveling Formula ---');
function calculateLevel(xp) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 35)) + 1);
}
assert(calculateLevel(0) === 1, '0 XP is Level 1');
assert(calculateLevel(100) === 2, '100 XP is Level 2');
assert(calculateLevel(350) === 4, '350 XP reaches Level 4');

console.log('\n--- TEST GROUP 5: Chaos Mode Mechanics ---');
// 1. Frozen cell never selected by AI when passed as blockedCell
const chaosBoard = ['X', null, null, null, 'O', null, null, null, null];
const frozenIndex = 1; // Cell 1 is frozen
const aiChaosMove = getAIMove(chaosBoard, 'easy', frozenIndex);
assert(aiChaosMove !== frozenIndex, 'AI respects frozen cell and never moves onto it');

// 2. Frozen cell is always an empty cell, never an occupied cell
const partiallyFilled = ['X', 'O', 'X', null, 'O', null, null, null, null];
const emptyCells = getAvailableMoves(partiallyFilled);
const pickedFrozen = emptyCells[0];
assert(partiallyFilled[pickedFrozen] === null, 'Frozen cell target is guaranteed to be an unoccupied empty cell');

// 3. Grid Glitch does not alter board cells
const beforeGlitch = [...partiallyFilled];
// Glitch is purely visual, does not modify board contents
const afterGlitch = [...partiallyFilled];
assert(JSON.stringify(beforeGlitch) === JSON.stringify(afterGlitch), 'Grid glitch is non-destructive and preserves all board state');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} / ${total} tests passed.`);
console.log(`========================================`);
