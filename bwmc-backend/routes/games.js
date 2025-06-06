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
const gameButtons = document.querySelectorAll('.game-btn');
const gameBoard = document.getElementById('game-board');
const gameTitle = document.getElementById('game-title');
const gameMessage = document.getElementById('game-message');
const ticTacToeBoard = document.getElementById('tic-tac-toe-board');
const chessCanvas = document.getElementById('chess-board');
const checkersCanvas = document.getElementById('checkers-board');
const snakeCanvas = document.getElementById('snake-board');
const minesweeperBoard = document.createElement('div');
minesweeperBoard.id = 'minesweeper-board';
gameBoard.appendChild(minesweeperBoard);

const resetTicTacToe = document.getElementById('reset-tic-tac-toe');
const resetChess = document.getElementById('reset-chess');
const resetCheckers = document.getElementById('reset-checkers');
const resetSnake = document.getElementById('reset-snake');
const resetMinesweeper = document.createElement('button');
resetMinesweeper.id = 'reset-minesweeper';
resetMinesweeper.innerHTML = '<i class="fas fa-redo"></i> Reset Minesweeper';
gameBoard.appendChild(resetMinesweeper);

// Load chess.js dynamically
const chessScript = document.createElement('script');
chessScript.src = 'https://cdn.jsdelivr.net/npm/chess.js@0.12.0/chess.min.js';
document.head.appendChild(chessScript);

// Game state variables
let currentGame = null;
let chessGame, chessCtx, checkersGame, checkersCtx, snakeGame, snakeCtx, minesweeperGame;

// Initialize games
function initGames() {
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            const game = button.dataset.game;
            switchGame(game);
        });
    });

    resetTicTacToe.addEventListener('click', () => {
        if (currentGame === 'tic-tac-toe') {
            initTicTacToe(); // Assumed existing function
            gameMessage.textContent = '';
        }
    });

    resetChess.addEventListener('click', () => {
        if (currentGame === 'chess') {
            initChess();
            gameMessage.textContent = 'Your move (white)';
        }
    });

    resetCheckers.addEventListener('click', () => {
        if (currentGame === 'checkers') {
            initCheckers();
            gameMessage.textContent = 'Your move (red)';
        }
    });

    resetSnake.addEventListener('click', () => {
        if (currentGame === 'snake') {
            initSnake();
            gameMessage.textContent = 'Use arrow keys to move';
        }
    });

    resetMinesweeper.addEventListener('click', () => {
        if (currentGame === 'minesweeper') {
            initMinesweeper();
            gameMessage.textContent = 'Click to reveal, right-click to flag';
        }
    });
}

// Switch between games
function switchGame(game) {
    currentGame = game;
    gameTitle.textContent = game.charAt(0).toUpperCase() + game.slice(1).replace('-', ' ');
    gameBoard.style.display = 'block';
    ticTacToeBoard.style.display = 'none';
    chessCanvas.style.display = 'none';
    checkersCanvas.style.display = 'none';
    snakeCanvas.style.display = 'none';
    minesweeperBoard.style.display = 'none';
    resetTicTacToe.style.display = 'none';
    resetChess.style.display = 'none';
    resetCheckers.style.display = 'none';
    resetSnake.style.display = 'none';
    resetMinesweeper.style.display = 'none';

    switch (game) {
        case 'tic-tac-toe':
            ticTacToeBoard.style.display = 'block';
            resetTicTacToe.style.display = 'inline-block';
            initTicTacToe(); // Assumed existing function
            gameMessage.textContent = '';
            break;
        case 'chess':
            chessCanvas.style.display = 'block';
            resetChess.style.display = 'inline-block';
            initChess();
            gameMessage.textContent = 'Your move (white)';
            break;
        case 'checkers':
            checkersCanvas.style.display = 'block';
            resetCheckers.style.display = 'inline-block';
            initCheckers();
            gameMessage.textContent = 'Your move (red)';
            break;
        case 'snake':
            snakeCanvas.style.display = 'block';
            resetSnake.style.display = 'inline-block';
            initSnake();
            gameMessage.textContent = 'Use arrow keys to move';
            break;
        case 'minesweeper':
            minesweeperBoard.style.display = 'inline-grid';
            resetMinesweeper.style.display = 'inline-block';
            initMinesweeper();
            gameMessage.textContent = 'Click to reveal, right-click to flag';
            break;
    }
}

// Chess implementation
function initChess() {
    if (typeof Chess === 'undefined') {
        setTimeout(initChess, 100);
        return;
    }
    chessGame = new Chess();
    chessCtx = chessCanvas.getContext('2d');
    drawChessBoard();
    chessCanvas.addEventListener('click', handleChessClick);
}

function drawChessBoard() {
    const size = 400 / 8;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            chessCtx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#769656';
            chessCtx.fillRect(col * size, row * size, size, size);
        }
    }
    const fen = chessGame.fen().split(' ')[0];
    fen.split('/').forEach((r, row) => {
        let col = 0;
        for (let char of r) {
            if (isNaN(char)) {
                chessCtx.fillStyle = char === char.toUpperCase() ? '#000000' : '#ff0000';
                chessCtx.font = '30px Arial';
                chessCtx.textAlign = 'center';
                chessCtx.textBaseline = 'middle';
                chessCtx.fillText(getChessPiece(char), (col + 0.5) * size, (7 - row + 0.5) * size);
                col++;
            } else {
                col += parseInt(char);
            }
        }
    });
}

function getChessPiece(char) {
    const pieces = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };
    return pieces[char] || '';
}

let selectedChessSquare = null;
function handleChessClick(e) {
    const size = 400 / 8;
    const rect = chessCanvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / size);
    const row = 7 - Math.floor((e.clientY - rect.top) / size);
    const square = String.fromCharCode(97 + col) + (row + 1);
    if (selectedChessSquare) {
        const move = { from: selectedChessSquare, to: square };
        if (chessGame.move(move)) {
            drawChessBoard();
            if (chessGame.isGameOver()) {
                gameMessage.textContent = chessGame.isCheckmate() ? 'Checkmate!' : 'Game over!';
            } else {
                setTimeout(computerChessMove, 500);
            }
        }
        selectedChessSquare = null;
    } else if (chessGame.get(square)) {
        selectedChessSquare = square;
    }
}

function computerChessMove() {
    const moves = chessGame.moves();
    if (moves.length > 0) {
        const move = moves[Math.floor(Math.random() * moves.length)];
        chessGame.move(move);
        drawChessBoard();
        if (chessGame.isGameOver()) {
            gameMessage.textContent = chessGame.isCheckmate() ? 'Checkmate!' : 'Game over!';
        } else {
            gameMessage.textContent = 'Your move (white)';
        }
    }
}

// Checkers implementation
function initCheckers() {
    checkersGame = {
        board: Array(32).fill(0).map((_, i) => (i < 12 ? 1 : i >= 20 ? -1 : 0)),
        turn: 1, // 1 for red (player), -1 for black (computer)
        selected: null
    };
    checkersCtx = checkersCanvas.getContext('2d');
    drawCheckersBoard();
    checkersCanvas.addEventListener('click', handleCheckersClick);
}

function drawCheckersBoard() {
    const size = 400 / 8;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            checkersCtx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#000000';
            checkersCtx.fillRect(col * size, row * size, size, size);
        }
    }
    checkersGame.board.forEach((piece, i) => {
        if (piece !== 0) {
            const row = Math.floor(i / 4);
            const col = (i % 4) * 2 + (row % 2 === 0 ? 1 : 0);
            checkersCtx.fillStyle = piece > 0 ? '#ff0000' : '#000000';
            checkersCtx.beginPath();
            checkersCtx.arc((col + 0.5) * size, (row + 0.5) * size, size * 0.4, 0, Math.PI * 2);
            checkersCtx.fill();
        }
    });
}

function handleCheckersClick(e) {
    if (checkersGame.turn !== 1) return;
    const size = 400 / 8;
    const rect = checkersCanvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / size);
    const row = Math.floor((e.clientY - rect.top) / size);
    if ((row + col) % 2 !== 1) return;
    const index = (row * 4) + Math.floor((col - (row % 2)) / 2);
    if (checkersGame.selected !== null) {
        const moves = getCheckersMoves(checkersGame.selected);
        const move = moves.find(m => m.to === index);
        if (move) {
            checkersGame.board[move.to] = checkersGame.board[checkersGame.selected];
            checkersGame.board[checkersGame.selected] = 0;
            if (move.capture !== null) {
                checkersGame.board[move.capture] = 0;
            }
            checkersGame.turn = -1;
            drawCheckersBoard();
            if (checkWinCheckers()) {
                gameMessage.textContent = 'You win!';
            } else {
                setTimeout(computerCheckersMove, 500);
            }
        }
        checkersGame.selected = null;
    } else if (checkersGame.board[index] === 1) {
        checkersGame.selected = index;
    }
}

function getCheckersMoves(index) {
    const moves = [];
    const row = Math.floor(index / 4);
    const col = (index % 4) * 2 + (row % 2 === 0 ? 1 : 0);
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    directions.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newIndex = (newRow * 4) + Math.floor((newCol - (newRow % 2)) / 2);
            if (checkersGame.board[newIndex] === 0) {
                moves.push({ to: newIndex, capture: null });
            } else if (checkersGame.board[newIndex] === -1) {
                const jumpRow = newRow + dr;
                const jumpCol = newCol + dc;
                if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
                    const jumpIndex = (jumpRow * 4) + Math.floor((jumpCol - (jumpRow % 2)) / 2);
                    if (checkersGame.board[jumpIndex] === 0) {
                        moves.push({ to: jumpIndex, capture: newIndex });
                    }
                }
            }
        }
    });
    return moves;
}

function computerCheckersMove() {
    const pieces = checkersGame.board.map((p, i) => ({ piece: p, index: i })).filter(p => p.piece === -1);
    for (let piece of pieces) {
        const moves = getCheckersMoves(piece.index);
        if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            checkersGame.board[move.to] = checkersGame.board[piece.index];
            checkersGame.board[piece.index] = 0;
            if (move.capture !== null) {
                checkersGame.board[move.capture] = 0;
            }
            checkersGame.turn = 1;
            drawCheckersBoard();
            if (checkWinCheckers()) {
                gameMessage.textContent = 'Computer wins!';
            } else {
                gameMessage.textContent = 'Your move (red)';
            }
            return;
        }
    }
}

function checkWinCheckers() {
    const red = checkersGame.board.filter(p => p === 1).length;
    const black = checkersGame.board.filter(p => p === -1).length;
    return red === 0 || black === 0;
}

// Snake implementation
function initSnake() {
    snakeGame = {
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        dx: 1,
        dy: 0,
        score: 0,
        gameOver: false
    };
    snakeCtx = snakeCanvas.getContext('2d');
    document.addEventListener('keydown', handleSnakeKey);
    updateSnake();
}

function handleSnakeKey(e) {
    switch (e.key) {
        case 'ArrowUp': if (snakeGame.dy === 0) { snakeGame.dx = 0; snakeGame.dy = -1; } break;
        case 'ArrowDown': if (snakeGame.dy === 0) { snakeGame.dx = 0; snakeGame.dy = 1; } break;
        case 'ArrowLeft': if (snakeGame.dx === 0) { snakeGame.dx = -1; snakeGame.dy = 0; } break;
        case 'ArrowRight': if (snakeGame.dx === 0) { snakeGame.dx = 1; snakeGame.dy = 0; } break;
    }
}

function updateSnake() {
    if (snakeGame.gameOver) return;
    const head = { x: snakeGame.snake[0].x + snakeGame.dx, y: snakeGame.snake[0].y + snakeGame.dy };
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || snakeGame.snake.some(s => s.x === head.x && s.y === head.y)) {
        snakeGame.gameOver = true;
        gameMessage.textContent = `Game over! Score: ${snakeGame.score}`;
        return;
    }
    snakeGame.snake.unshift(head);
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score++;
        snakeGame.food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) };
    } else {
        snakeGame.snake.pop();
    }
    drawSnake();
    setTimeout(updateSnake, 100);
}

function drawSnake() {
    snakeCtx.clearRect(0, 0, 400, 400);
    const size = 20;
    snakeCtx.fillStyle = '#2563eb';
    snakeGame.snake.forEach(s => {
        snakeCtx.fillRect(s.x * size, s.y * size, size - 2, size - 2);
    });
    snakeCtx.fillStyle = '#ff4444';
    snakeCtx.fillRect(snakeGame.food.x * size, snakeGame.food.y * size, size - 2, size - 2);
}

// Minesweeper implementation
function initMinesweeper() {
    minesweeperGame = {
        board: Array(9).fill().map(() => Array(9).fill().map(() => ({ mine: false, revealed: false, flagged: false, adjacent: 0 }))),
        gameOver: false,
        mines: 10
    };
    minesweeperBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleMinesweeperClick);
            cell.addEventListener('contextmenu', handleMinesweeperRightClick);
            minesweeperBoard.appendChild(cell);
        }
    }
    placeMines();
    calculateAdjacent();
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < minesweeperGame.mines) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (!minesweeperGame.board[row][col].mine) {
            minesweeperGame.board[row][col].mine = true;
            minesPlaced++;
        }
    }
}

function calculateAdjacent() {
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let count = 0;
            directions.forEach(([dr, dc]) => {
                const nr = i + dr;
                const nc = j + dc;
                if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && minesweeperGame.board[nr][nc].mine) {
                    count++;
                }
            });
            minesweeperGame.board[i][j].adjacent = count;
        }
    }
}

function handleMinesweeperClick(e) {
    if (minesweeperGame.gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    revealCell(row, col);
    drawMinesweeper();
    checkMinesweeperWin();
}

function handleMinesweeperRightClick(e) {
    e.preventDefault();
    if (minesweeperGame.gameOver) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (!minesweeperGame.board[row][col].revealed) {
        minesweeperGame.board[row][col].flagged = !minesweeperGame.board[row][col].flagged;
        drawMinesweeper();
    }
}

function revealCell(row, col) {
    if (row < 0 || row >= 9 || col < 0 || col >= 9 || minesweeperGame.board[row][col].revealed || minesweeperGame.board[row][col].flagged) return;
    minesweeperGame.board[row][col].revealed = true;
    if (minesweeperGame.board[row][col].mine) {
        minesweeperGame.gameOver = true;
        gameMessage.textContent = 'Game over! You hit a mine!';
        revealAllMines();
        return;
    }
    if (minesweeperGame.board[row][col].adjacent === 0) {
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        directions.forEach(([dr, dc]) => revealCell(row + dr, col + dc));
    }
}

function revealAllMines() {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (minesweeperGame.board[i][j].mine) {
                minesweeperGame.board[i][j].revealed = true;
            }
        }
    }
    drawMinesweeper();
}

function drawMinesweeper() {
    const cells = minesweeperBoard.querySelectorAll('.minesweeper-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const state = minesweeperGame.board[row][col];
        cell.className = 'minesweeper-cell';
        cell.textContent = '';
        if (state.revealed) {
            cell.classList.add('revealed');
            if (state.mine) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (state.adjacent > 0) {
                cell.textContent = state.adjacent;
            }
        } else if (state.flagged) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
        }
    });
}

function checkMinesweeperWin() {
    let safeCells = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (!minesweeperGame.board[i][j].mine && minesweeperGame.board[i][j].revealed) {
                safeCells++;
            }
        }
    }
    if (safeCells === 81 - minesweeperGame.mines) {
        minesweeperGame.gameOver = true;
        gameMessage.textContent = 'You win!';
        revealAllMines();
    }
}

// Start initialization when chess.js is loaded
chessScript.onload = initGames;