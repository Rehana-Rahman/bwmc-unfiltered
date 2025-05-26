// script.js

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// Initialize token and user only in browser
const token = isBrowser ? localStorage.getItem('token') : null;
const user = token && isBrowser ? JSON.parse(atob(token.split('.')[1])) : null;

// Show/hide sections
function showSection(sectionId) {
  if (!isBrowser) return;
  document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');

  // Initialize games only when Games section is shown
  if (sectionId === 'games') {
    initializeTicTacToe();
    initializeSnake();
    initializeMemoryMatch();
  }
}

// Navigation
if (isBrowser) {
  const navLinks = [
    'home', 'profile', 'groups', 'events', 'games', 'business', 'settings', 'dm'
  ];
  navLinks.forEach(id => {
    const link = document.getElementById(`${id}-link`);
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(id);
      });
    } else {
      console.error(`Navigation link #${id}-link not found`);
    }
  });

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/logout', { method: 'GET' });
        if (!response.ok) {
          throw new Error(`Logout failed with status: ${response.status}`);
        }
        localStorage.removeItem('token');
        window.location.href = '/';
      } catch (error) {
        console.error('Error during logout:', error);
        alert('Logout failed. Please try again.');
      }
    });
  }
}

// Post Modal
if (isBrowser) {
  const plusButton = document.getElementById('plus-button');
  const closePostModal = document.getElementById('close-post-modal');
  const submitPost = document.getElementById('submit-post');

  if (plusButton) {
    plusButton.addEventListener('click', () => {
      document.getElementById('post-modal').classList.remove('hidden');
    });
  }
  if (closePostModal) {
    closePostModal.addEventListener('click', () => {
      document.getElementById('post-modal').classList.add('hidden');
    });
  }
  if (submitPost) {
    submitPost.addEventListener('click', async () => {
      const content = document.getElementById('post-content').value;
      const link = document.getElementById('post-link').value;
      try {
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ content, link, userId: user?.id })
        });
        if (!response.ok) {
          throw new Error('Failed to create post');
        }
        document.getElementById('post-content').value = '';
        document.getElementById('post-link').value = '';
        document.getElementById('post-modal').classList.add('hidden');
        fetchPosts();
      } catch (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
      }
    });
  }
}

// Post and Comment
async function fetchPosts() {
  if (!isBrowser) return;
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const posts = await response.json();
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    for (const post of posts) {
      const comments = await fetchComments(post.id);
      postsDiv.innerHTML += `
        <div class="bg-blue-50 p-4 rounded-lg mb-4">
          <p><strong>${post.username}</strong>: ${post.content}</p>
          ${post.link ? `<a href="${post.link}" class="text-blue-600" target="_blank">Link</a>` : ''}
          <p class="text-gray-500 text-sm">${new Date(post.created_at).toLocaleString()}</p>
          <div class="mt-2">
            <h4 class="text-sm font-semibold">Comments</h4>
            <div id="comments-${post.id}" class="ml-4">
              ${comments.map(c => `
                <p class="text-sm"><strong>${c.username}</strong>: ${c.content}</p>
              `).join('')}
            </div>
            <input id="comment-${post.id}" class="w-full p-2 border rounded mt-2" placeholder="Add a comment...">
            <button onclick="submitComment(${post.id})" class="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700">Comment</button>
          </div>
          <div class="mt-2">
            <button id="like-${post.id}" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Like</button>
            <button id="share-${post.id}" class="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Share</button>
            <button id="follow-${post.id}" class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Follow</button>
          </div>
        </div>
      `;
      addPostInteractions(post.id);
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    document.getElementById('posts').innerHTML = '<p class="text-red-600">Failed to load posts. Please try again later.</p>';
  }
}

function addPostInteractions(postId) {
  const likeBtn = document.getElementById(`like-${postId}`);
  const shareBtn = document.getElementById(`share-${postId}`);
  const followBtn = document.getElementById(`follow-${postId}`);
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      try {
        await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        alert('Post liked!');
      } catch (error) {
        console.error('Error liking post:', error);
      }
    });
  }
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`);
      alert('Post link copied to clipboard!');
    });
  }
  if (followBtn) {
    followBtn.addEventListener('click', async () => {
      try {
        await fetch(`/api/users/${postId}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        alert('User followed!');
      } catch (error) {
        console.error('Error following user:', error);
      }
    });
  }
}

async function fetchComments(postId) {
  try {
    const response = await fetch(`/api/comments/${postId}`);
    if (!response.ok) throw new Error('Failed to fetch comments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.getElementById('postForm');
  const postsDiv = document.getElementById('posts');

  // Fetch and display posts
  async function fetchPosts() {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    postsDiv.innerHTML = posts.map(post => `
      <div class="post">
        <p>${post.content}</p>
        ${post.link ? `<a href="${post.link}" target="_blank">${post.link}</a>` : ''}
        <div>
          <button onclick="likePost('${post._id}')">Like (${post.likes})</button>
        </div>
      </div>
    `).join('');
  }

  // Handle new post submission
  if (postForm) {
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = document.getElementById('content').value;
      const link = document.getElementById('link').value;
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, link })
      });
      postForm.reset();
      fetchPosts();
    });
  }

  // Like a post
  window.likePost = async (id) => {
    await fetch(`/api/posts/${id}/like`, { method: 'POST' });
    fetchPosts();
  };

  fetchPosts();
});
async function submitComment(postId) {
  if (!isBrowser) return;
  const content = document.getElementById(`comment-${postId}`).value;
  try {
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ postId, userId: user?.id, content })
    });
    fetchPosts();
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
}

// Profile
document.addEventListener('DOMContentLoaded', () => {
  // Handle Add Friend button click
  document.getElementById('add-friend').addEventListener('click', async () => {
    const friendUsername = document.getElementById('friend-username').value.trim();
    if (!friendUsername) {
      alert('Please enter a username');
      return;
    }
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUsername }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add friend');
      alert(data.message);
      document.getElementById('friend-username').value = ''; // Clear input
      // Optionally refresh friends list
      fetchProfile(); // Assuming a function to refresh profile data
    } catch (error) {
      console.error('Error adding friend:', error.message);
      alert('Error: ' + error.message);
    }
  });

  // Function to fetch and display profile data (including friends)
  async function fetchProfile() {
    try {
      const response = await fetch('/api/profile'); // Hypothetical endpoint
      if (!response.ok) throw new Error('Failed to load profile');
      const profile = await response.json();
      document.getElementById('username-display').textContent = profile.username;
      document.getElementById('bio-display').textContent = profile.bio || 'No bio';
      document.getElementById('friends-list').textContent = profile.friends.join(', ') || 'No friends';
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  }

  // Function to fetch events (to ensure events load correctly)
  async function fetchEvents() {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to load events');
      const events = await response.json();
      // Update UI with events (implement as needed)
      console.log('Events:', events);
    } catch (error) {
      console.error('Error fetching events:', error.message);
      alert('Cannot load events');
    }
  }

  // Initial load
  fetchProfile();
  fetchEvents();
});

// Tic-Tac-Toe Game
let ticTacToeCurrentPlayer = 'X';
let ticTacToeBoard = ['', '', '', '', '', '', '', '', ''];
let ticTacToeGameActive = true;

function initializeTicTacToe() {
  const ticTacToe = document.getElementById('tic-tac-toe');
  const ticTacToeStatus = document.getElementById('tic-tac-toe-status');
  if (!ticTacToe || !ticTacToeStatus) {
    console.error('Tic-Tac-Toe elements not found');
    return;
  }
  ticTacToe.innerHTML = '';
  ticTacToeBoard = ['', '', '', '', '', '', '', '', ''];
  ticTacToeGameActive = true;
  ticTacToeCurrentPlayer = 'X';
  ticTacToeStatus.textContent = `Player ${ticTacToeCurrentPlayer}'s Turn`;
  ticTacToeStatus.className = 'text-center mb-4 text-lg font-semibold text-blue-600';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'bg-white border-2 border-blue-600 p-4 text-center text-3xl font-bold h-16 flex items-center justify-center cursor-pointer hover:bg-blue-100';
    cell.dataset.index = i;
    cell.addEventListener('click', handleTicTacToeCellClick);
    ticTacToe.appendChild(cell);
  }
}

function checkTicTacToeWin() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (ticTacToeBoard[a] && ticTacToeBoard[a] === ticTacToeBoard[b] && ticTacToeBoard[a] === ticTacToeBoard[c]) {
      ticTacToeGameActive = false;
      return true;
    }
  }

  if (!ticTacToeBoard.includes('')) {
    ticTacToeGameActive = false;
    return true;
  }

  return false;
}

function handleTicTacToeCellClick(e) {
  const ticTacToeStatus = document.getElementById('tic-tac-toe-status');
  const index = parseInt(e.target.dataset.index);
  if (isNaN(index) || ticTacToeBoard[index] || !ticTacToeGameActive) return;

  ticTacToeBoard[index] = ticTacToeCurrentPlayer;
  e.target.textContent = ticTacToeCurrentPlayer;
  e.target.classList.add(ticTacToeCurrentPlayer === 'X' ? 'text-blue-600' : 'text-red-600');
  e.target.classList.remove('cursor-pointer', 'hover:bg-blue-100');

  const winResult = checkTicTacToeWin();
  if (winResult) {
    ticTacToeStatus.textContent = ticTacToeBoard.includes('') ? `Player ${ticTacToeCurrentPlayer} Wins!` : "It's a Draw!";
    ticTacToeStatus.className = 'text-center mb-4 text-lg font-semibold ' + (ticTacToeBoard.includes('') ? 'text-green-600' : 'text-yellow-600');
  } else {
    ticTacToeCurrentPlayer = ticTacToeCurrentPlayer === 'X' ? 'O' : 'X';
    ticTacToeStatus.textContent = `Player ${ticTacToeCurrentPlayer}'s Turn`;
  }

  fetch('/api/games/tic-tac-toe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board: ticTacToeBoard, player: ticTacToeCurrentPlayer })
  }).catch(error => console.error('Error sending Tic-Tac-Toe state:', error));
}

if (isBrowser) {
  const resetTicTacToe = document.getElementById('reset-tic-tac-toe');
  if (resetTicTacToe) {
    resetTicTacToe.addEventListener('click', initializeTicTacToe);
  }
}

// Snake Game
const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let snakeScoreValue = 0;
let snakeGameActive = false;
let snakeGameLoop;

function initializeSnake() {
  const snakeCanvas = document.getElementById('snake-canvas');
  const snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
  const snakeScore = document.getElementById('snake-score');
  const snakeStatus = document.getElementById('snake-status');
  if (!snakeCanvas || !snakeCtx || !snakeScore || !snakeStatus) {
    console.error('Snake game elements not found');
    return;
  }
  const tileCount = snakeCanvas.width / gridSize;
  snake = [{ x: 10, y: 10 }];
  food = generateSnakeFood(tileCount);
  dx = 1;
  dy = 0;
  snakeScoreValue = 0;
  snakeGameActive = false;
  snakeScore.textContent = `Score: ${snakeScoreValue}`;
  snakeStatus.textContent = 'Press Start to Play';
  snakeStatus.className = 'text-lg font-semibold text-blue-600';
  const startSnakeBtn = document.getElementById('start-snake');
  const restartSnakeBtn = document.getElementById('restart-snake');
  startSnakeBtn.classList.remove('hidden');
  restartSnakeBtn.classList.add('hidden');
  clearInterval(snakeGameLoop);
  drawSnakeGame(snakeCtx, snakeCanvas);
}

function generateSnakeFood(tileCount) {
  const x = Math.floor(Math.random() * tileCount);
  const y = Math.floor(Math.random() * tileCount);
  if (snake.some(segment => segment.x === x && segment.y === y)) {
    return generateSnakeFood(tileCount);
  }
  return { x, y };
}

function drawSnakeGame(ctx, canvas) {
  if (!ctx) return;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2563eb';
  snake.forEach(segment => {
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function updateSnakeGame() {
  const snakeCanvas = document.getElementById('snake-canvas');
  const snakeCtx = snakeCanvas ? snakeCanvas.getContext('2d') : null;
  const snakeScore = document.getElementById('snake-score');
  const snakeStatus = document.getElementById('snake-status');
  if (!snakeGameActive || !snakeCtx) return;

  const tileCount = snakeCanvas.width / gridSize;
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
    snakeGameActive = false;
    snakeStatus.textContent = 'Game Over! Press Restart to Play Again';
    snakeStatus.className = 'text-lg font-semibold text-red-600';
    document.getElementById('start-snake').classList.add('hidden');
    document.getElementById('restart-snake').classList.remove('hidden');
    clearInterval(snakeGameLoop);
    return;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    snakeScoreValue += 10;
    snakeScore.textContent = `Score: ${snakeScoreValue}`;
    food = generateSnakeFood(tileCount);
  } else {
    snake.pop();
  }
  drawSnakeGame(snakeCtx, snakeCanvas);
}

if (isBrowser) {
  document.addEventListener('keydown', (e) => {
    if (!snakeGameActive) return;
    switch (e.key) {
      case 'ArrowUp':
        if (dy === 0) { dx = 0; dy = -1; }
        break;
      case 'ArrowDown':
        if (dy === 0) { dx = 0; dy = 1; }
        break;
      case 'ArrowLeft':
        if (dx === 0) { dx = -1; dy = 0; }
        break;
      case 'ArrowRight':
        if (dx === 0) { dx = 1; dy = 0; }
        break;
    }
  });

  const startSnakeBtn = document.getElementById('start-snake');
  if (startSnakeBtn) {
    startSnakeBtn.addEventListener('click', () => {
      if (!snakeGameActive) {
        snakeGameActive = true;
        document.getElementById('snake-status').textContent = 'Playing...';
        snakeGameLoop = setInterval(updateSnakeGame, 100);
        startSnakeBtn.classList.add('hidden');
        document.getElementById('restart-snake').classList.remove('hidden');
        updateSnakeGame();
      }
    });
  }

  const restartSnakeBtn = document.getElementById('restart-snake');
  if (restartSnakeBtn) {
    restartSnakeBtn.addEventListener('click', () => {
      initializeSnake();
      snakeGameActive = true;
      document.getElementById('snake-status').textContent = 'Playing...';
      snakeGameLoop = setInterval(updateSnakeGame, 100);
    });
  }
}

// Memory Match Game
const emojis = ['🐶', '🐱', '🐰', '🦁', '🐯', '🐼', '🐵', '🦊'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let memoryGameActive = true;

function initializeMemoryMatch() {
  const memoryGame = document.getElementById('memory-game');
  const memoryMoves = document.getElementById('memory-moves');
  const memoryStatus = document.getElementById('memory-status');
  if (!memoryGame || !memoryMoves || !memoryStatus) {
    console.error('Memory Match elements not found');
    return;
  }
  memoryGame.innerHTML = '';
  memoryCards = [];
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  memoryGameActive = true;
  memoryMoves.textContent = `Moves: ${moves}`;
  memoryStatus.textContent = 'Match the cards!';
  memoryStatus.className = 'text-lg font-semibold text-blue-600';

  const cardValues = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
  cardValues.forEach((value, index) => {
    const card = document.createElement('div');
    card.className = 'bg-blue-200 border-2 border-blue-600 p-4 text-3xl text-center h-16 w-16 flex items-center justify-center cursor-pointer hover:bg-blue-300';
    card.dataset.index = index;
    card.dataset.value = value;
    card.textContent = '❓';
    card.addEventListener('click', handleMemoryCardClick);
    memoryGame.appendChild(card);
    memoryCards.push({ element: card, value, flipped: false, matched: false });
  });
}

function handleMemoryCardClick(e) {
  if (!memoryGameActive) return;
  const index = parseInt(e.target.dataset.index);
  const card = memoryCards[index];
  if (card.flipped || card.matched) return;

  card.flipped = true;
  card.element.textContent = card.value;
  card.element.classList.add('bg-blue-400');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    document.getElementById('memory-moves').textContent = `Moves: ${moves}`;
    const [card1, card2] = flippedCards;

    if (card1.value === card2.value) {
      card1.matched = true;
      card2.matched = true;
      card1.element.classList.add('bg-green-200');
      card2.element.classList.add('bg-green-200');
      matchedPairs++;
      flippedCards = [];
      if (matchedPairs === emojis.length) {
        memoryGameActive = false;
        document.getElementById('memory-status').textContent = 'You Win! Press Reset to Play Again';
        document.getElementById('memory-status').className = 'text-lg font-semibold text-green-600';
      }
    } else {
      memoryGameActive = false;
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        card1.element.textContent = '❓';
        card2.element.textContent = '❓';
        card1.element.classList.remove('bg-blue-400');
        card2.element.classList.remove('bg-blue-400');
        flippedCards = [];
        memoryGameActive = true;
      }, 1000);
    }
  }
}

if (isBrowser) {
  const resetMemoryBtn = document.getElementById('reset-memory');
  if (resetMemoryBtn) {
    resetMemoryBtn.addEventListener('click', initializeMemoryMatch);
  }
}

// Business
async function fetchBusinesses() {
  if (!isBrowser) return;
  try {
    const response = await fetch('/api/business');
    if (!response.ok) throw new Error('Failed to fetch businesses');
    const businesses = await response.json();
    document.getElementById('business-list').innerHTML = businesses.map(b => `
      <div class="bg-blue-50 p-4 rounded-lg">
        <p><strong>${b.name}</strong> by ${b.username}</p>
        <p>${b.description}</p>
        ${b.link ? `<a href="${b.link}" class="text-blue-600" target="_blank">Link</a>` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching businesses:', error);
    document.getElementById('business-list').innerHTML = '<p class="text-red-600">Failed to load businesses</p>';
  }
}

if (isBrowser) {
  const promoteBusinessBtn = document.getElementById('promote-business');
  if (promoteBusinessBtn) {
    promoteBusinessBtn.addEventListener('click', async () => {
      const name = document.getElementById('business-name').value;
      const description = document.getElementById('business-desc').value;
      const link = document.getElementById('business-link').value;
      try {
        await fetch('/api/business', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name, description, link, userId: user?.id })
        });
        fetchBusinesses();
      } catch (error) {
        console.error('Error promoting business:', error);
      }
    });
  }
}

// Settings and DM
if (isBrowser) {
  const saveSettingsBtn = document.getElementById('save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const profilePic = document.getElementById('profile-pic').files[0];
      const profileName = document.getElementById('profile-name').value;
      const formData = new FormData();
      formData.append('profilePic', profilePic);
      formData.append('profileName', profileName);
      try {
        await fetch('/api/settings', { method: 'POST', body: formData });
        alert('Settings updated successfully!');
      } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings');
      }
    });
  }

  const sendDmBtn = document.getElementById('send-dm');
  if (sendDmBtn) {
    sendDmBtn.addEventListener('click', async () => {
      const username = document.getElementById('dm-username').value;
      const message = document.getElementById('dm-message').value;
      try {
        await fetch('/api/dm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, message })
        });
        alert('Message sent successfully!');
      } catch (error) {
        console.error('Error sending DM:', error);
        alert('Failed to send message');
      }
    });
  }
}

// Initial load
if (isBrowser) {
  if (token && user) {
    showSection('home');
    fetchPosts();
    loadProfile();
    fetchGroups();
    fetchChats();
    fetchEvents();
    fetchBusinesses();
  } else {
    showSection('post-comment');
  }
}