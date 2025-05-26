const express = require('express');
const router = express.Router();

// Enhanced Tic-Tac-Toe logic
router.post('/tic-tac-toe', (req, res) => {
  const { board, player } = req.body;

  // Validate board state
  if (!Array.isArray(board) || board.length !== 9) {
    return res.status(400).json({ error: 'Invalid board state' });
  }

  // Check for win or draw
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  let winner = null;
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      winner = board[a];
      break;
    }
  }

  if (winner) {
    return res.json({ message: `Player ${winner} wins!`, board });
  }

  if (!board.includes('')) {
    return res.json({ message: 'It\'s a draw!', board });
  }

  // Suggest next move (simple AI for demonstration)
  const emptyIndex = board.findIndex(cell => cell === '');
  if (emptyIndex !== -1) {
    board[emptyIndex] = player === 'X' ? 'O' : 'X';
  }

  res.json({ message: 'Move processed', board });
});

// Basic Chess logic
router.post('/chess', (req, res) => {
  const { board, move } = req.body;

  // Validate board and move
  if (!Array.isArray(board) || !move) {
    return res.status(400).json({ error: 'Invalid board or move' });
  }

  // Placeholder for move validation and processing
  res.json({ message: 'Move processed', board });
});

// Basic Checkers logic
router.post('/checkers', (req, res) => {
  const { board, move } = req.body;

  // Validate board and move
  if (!Array.isArray(board) || !move) {
    return res.status(400).json({ error: 'Invalid board or move' });
  }

  // Placeholder for move validation and processing
  res.json({ message: 'Move processed', board });
});

// Snake game logic
router.post('/snake', (req, res) => {
  const { snake, food, direction } = req.body;

  // Validate snake and food positions
  if (!Array.isArray(snake) || !food || !direction) {
    return res.status(400).json({ error: 'Invalid game state' });
  }

  // Placeholder for snake movement logic
  res.json({ message: 'Move processed', snake, food });
});

// Minesweeper logic
router.post('/minesweeper', (req, res) => {
  const { board, action } = req.body;

  // Validate board and action
  if (!Array.isArray(board) || !action) {
    return res.status(400).json({ error: 'Invalid game state' });
  }

  // Placeholder for Minesweeper logic
  res.json({ message: 'Action processed', board });
});

router.get('/test', (req, res) => {
  res.json({ message: 'Games router is working' });
});

module.exports = router;