document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        hamburgerMenu: document.querySelector('.hamburger-menu'),
        sidebar: document.querySelector('.sidebar'),
        settingsBtn: document.getElementById('settings-btn'),
        changeProfileBtn: document.getElementById('change-profile-btn'),
        openPostModalBtn: document.getElementById('open-post-modal'),
        openStoryModalBtn: document.getElementById('open-story-modal'),
        logoutBtn: document.getElementById('logout-btn'),
        switchUserBtn: document.getElementById('switch-user-btn'),
        postModal: document.getElementById('post-modal'),
        storyModal: document.getElementById('story-modal'),
        settingsModal: document.getElementById('settings-modal'),
        friendModal: document.getElementById('friend-modal'),
        groupModal: document.getElementById('group-modal'),
        switchUserModal: document.getElementById('switch-user-modal'),
        storyViewer: document.getElementById('story-viewer'),
        storyContent: document.getElementById('story-content'),
        storyProgressBar: document.getElementById('story-progress-bar'),
        homeSection: document.getElementById('home-section'),
        aboutSection: document.getElementById('about-section'),
        discussionsSection: document.getElementById('discussions-section'),
        friendsSection: document.getElementById('friends-section'),
        groupsSection: document.getElementById('groups-section'),
        gamesSection: document.getElementById('games-section'),
        messagesSection: document.getElementById('messages-section'),
        profileSection: document.getElementById('profile-section'),
        storiesContainer: document.querySelector('.stories-container'),
        postsSection: document.querySelector('.posts'),
        friendsList: document.querySelector('.friends-list'),
        groupsList: document.querySelector('.groups-list'),
        conversationList: document.querySelector('.conversation-list'),
        dmList: document.querySelector('.dm-list'),
        chatUsername: document.getElementById('chat-username'),
        gameBoard: document.getElementById('game-board'),
        ticTacToeBoard: document.getElementById('tic-tac-toe-board'),
        chessBoard: document.getElementById('chess-board'),
        checkersBoard: document.getElementById('checkers-board'),
        snakeBoard: document.getElementById('snake-board'),
        gameMessage: document.getElementById('game-message'),
        discussionList: document.querySelector('.discussion-list'),
        navLinks: document.querySelectorAll('.nav-link'),
        closeModal: document.querySelectorAll('.close'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        addFriendBtn: document.getElementById('add-friend-btn'),
        manageGroupBtn: document.getElementById('manage-group-btn'),
        submitPostBtn: document.getElementById('submit-post'),
        submitStoryBtn: document.getElementById('submit-story'),
        saveSettingsBtn: document.getElementById('save-settings'),
        saveProfileBtn: document.getElementById('save-profile'),
        submitFriendBtn: document.getElementById('submit-friend'),
        createGroupBtn: document.getElementById('create-group'),
        joinGroupBtn: document.getElementById('join-group'),
        submitSwitchUserBtn: document.getElementById('submit-switch-user'),
        resetTicTacToeBtn: document.getElementById('reset-tic-tac-toe'),
        resetChessBtn: document.getElementById('reset-chess'),
        resetCheckersBtn: document.getElementById('reset-checkers'),
        resetSnakeBtn: document.getElementById('reset-snake'),
        sendDmBtn: document.getElementById('send-dm'),
        sendDiscussionBtn: document.getElementById('send-discussion'),
        themeSelect: document.getElementById('theme-select'),
        usernameInput: document.getElementById('username'),
        profileDpInput: document.getElementById('profile-dp'),
        bioInput: document.getElementById('bio'),
        usernameView: document.getElementById('username-view'),
        profileDpView: document.getElementById('profile-dp-view'),
        bioView: document.getElementById('bio-view'),
        postText: document.getElementById('post-text'),
        postImageInput: document.getElementById('post-image'),
        postImagePreview: document.getElementById('post-image-preview'),
        postGroupSelect: document.getElementById('post-group'),
        friendUsernameInput: document.getElementById('friend-username'),
        groupNameInput: document.getElementById('group-name'),
        storyImageInput: document.getElementById('story-image'),
        switchUsernameInput: document.getElementById('switch-username'),
        dmText: document.getElementById('dm-text'),
        discussionText: document.getElementById('discussion-text'),
        toast: document.querySelector('.toast'),
    };

    // Check for missing elements
    for (const [key, value] of Object.entries(elements)) {
        if (!value && key !== 'closeModal' && key !== 'navLinks' && key !== 'filterButtons') {
            console.error(`Element ${key} not found in DOM`);
            if (elements.toast) {
                elements.toast.textContent = `Missing element: ${key}`;
                elements.toast.classList.add('show');
                setTimeout(() => elements.toast.classList.remove('show'), 3000);
            }
        }
    }

    // Initialize Tic-Tac-Toe Board in DOM if missing
    function initializeTicTacToeBoard() {
        if (!elements.ticTacToeBoard) {
            showToast('Tic-Tac-Toe board not found');
            return;
        }
        const cells = elements.ticTacToeBoard.querySelectorAll('.tic-tac-toe-cell');
        if (cells.length !== 9) {
            elements.ticTacToeBoard.innerHTML = '';
            for (let i = 0; i < 9; i++) {
                const cell = document.createElement('button');
                cell.className = 'tic-tac-toe-cell';
                cell.dataset.index = i;
                elements.ticTacToeBoard.appendChild(cell);
            }
            showToast('Initialized Tic-Tac-Toe board');
        }
    }

    // Profile data
    let profileData = {
        username: localStorage.getItem('username') || 'YourUsername',
        profileDp: 'https://via.placeholder.com/100',
        bio: 'Your bio goes here...',
        friends: [],
        groups: [],
        prevProfileDpUrl: null
    };

    // In-memory data
    let stories = [];
    let currentConversation = null;
    let ticTacToeState = {
        board: Array(9).fill(''),
        currentPlayer: 'X'
    };
    let chessState = {
        board: [],
        selected: null,
        currentPlayer: 'white',
        gameOver: false
    };
    let checkersState = {
        board: [],
        selected: null,
        currentPlayer: 'red',
        gameOver: false
    };
    let snakeState = {
        snake: [{ x: 10, y: 10 }],
        food: { x: 15, y: 15 },
        dx: 1,
        dy: 0,
        score: 0,
        gameOver: false,
        interval: null
    };
    const mockGroupNames = ['StudyGroup', 'ChillZone', 'GameNight'];

    // Toast Notification
    function showToast(message) {
        if (elements.toast) {
            elements.toast.textContent = message;
            elements.toast.classList.add('show');
            setTimeout(() => elements.toast.classList.remove('show'), 3000);
        } else {
            console.warn('Toast missing:', message);
        }
    }

    // Update profile view
    function updateProfileView() {
        if (elements.usernameView) elements.usernameView.textContent = profileData.username;
        if (elements.profileDpView) elements.profileDpView.src = profileData.profileDp;
        if (elements.bioView) elements.bioView.textContent = profileData.bio || 'No bio set.';
    }

    // Update friends list
    async function updateFriendsList() {
        if (!elements.friendsList) {
            showToast('Friends list container not found');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/friends/${profileData.username}`);
            if (response.ok) {
                profileData.friends = await response.json();
                elements.friendsList.innerHTML = '';
                profileData.friends.forEach(friend => {
                    const friendItem = document.createElement('div');
                    friendItem.className = 'friend-item';
                    friendItem.innerHTML = `
                        <span>${friend}</span>
                        <button class="delete-friend-btn" data-friend="${friend}">Remove</button>
                    `;
                    elements.friendsList.appendChild(friendItem);
                });
                updateConversationList();
            } else {
                showToast('Failed to load friends');
            }
        } catch (error) {
            showToast('Error loading friends');
            console.error('Error fetching friends:', error);
        }
    }

    // Update groups list
    function updateGroupsList() {
        if (!elements.groupsList || !elements.postGroupSelect) {
            showToast('Groups list or group select not found');
            return;
        }
        elements.groupsList.innerHTML = '';
        profileData.groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <span>${group}</span>
                <button class="leave-group-btn" data-group="${group}">Leave</button>
            `;
            elements.groupsList.appendChild(groupItem);
        });

        elements.postGroupSelect.innerHTML = '<option value="none">No Group</option>';
        profileData.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            elements.postGroupSelect.appendChild(option);
        });
    }

    // Update conversation list
    function updateConversationList() {
        if (!elements.conversationList) {
            showToast('Conversation list not found');
            return;
        }
        elements.conversationList.innerHTML = '<h3>Conversations</h3>';
        if (profileData.friends.length === 0) {
            const noFriends = document.createElement('div');
            noFriends.textContent = 'No friends added. Add friends to start chatting!';
            elements.conversationList.appendChild(noFriends);
            return;
        }
        profileData.friends.forEach(friend => {
            const conversation = document.createElement('div');
            conversation.className = 'conversation';
            conversation.dataset.user = friend;
            conversation.innerHTML = `
                <img src="https://via.placeholder.com/40" alt="${friend}">
                <span>${friend}</span>
            `;
            elements.conversationList.appendChild(conversation);
        });
    }

    // Update chat window
    async function updateChatWindow(user) {
        currentConversation = user;
        if (elements.chatUsername) elements.chatUsername.textContent = user || 'Select a conversation';
        if (!elements.dmList) {
            showToast('DM list not found');
            return;
        }
        elements.dmList.innerHTML = '';
        if (user) {
            try {
                const response = await fetch(`http://localhost:5000/api/messages/${profileData.username}/${user}`);
                if (response.ok) {
                    const messages = await response.json();
                    messages.forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = `dm-message ${msg.sender === profileData.username ? 'sent' : 'received'}`;
                        messageDiv.textContent = msg.text;
                        elements.dmList.appendChild(messageDiv);
                    });
                    elements.dmList.scrollTop = elements.dmList.scrollHeight;
                } else {
                    const error = await response.json();
                    showToast(`Failed to load messages: ${error.error || 'Unknown error'}`);
                }
            } catch (error) {
                showToast('Error loading messages');
                console.error('Error fetching messages:', error);
            }
        }
    }

    // Update discussions
    async function updateDiscussions() {
        if (!elements.discussionList) {
            showToast('Discussion list not found');
            return;
        }
        elements.discussionList.innerHTML = '';
        try {
            const response = await fetch(`http://localhost:5000/api/discussions?group=${profileData.groups.join(',')}`);
            if (response.ok) {
                const discussions = await response.json();
                discussions.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = 'discussion-message';
                    messageDiv.innerHTML = `<span>${msg.username} (${msg.group || 'General'}):</span> ${msg.text}`;
                    elements.discussionList.appendChild(messageDiv);
                });
                elements.discussionList.scrollTop = elements.discussionList.scrollHeight;
            } else {
                showToast('Failed to load discussions');
            }
        } catch (error) {
            showToast('Error loading discussions');
            console.error(error);
        }
    }

    // Initialize Chess Board
    function initializeChessBoard() {
        const initialBoard = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
        chessState.board = initialBoard;
        chessState.currentPlayer = 'white';
        chessState.selected = null;
        chessState.gameOver = false;
    }

    // Draw Chess Board
    function drawChessBoard() {
        if (!elements.chessBoard) {
            showToast('Chess board not found');
            return;
        }
        const ctx = elements.chessBoard.getContext('2d');
        const size = elements.chessBoard.width / 8;
        ctx.clearRect(0, 0, elements.chessBoard.width, elements.chessBoard.height);

        // Draw board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#769656';
                ctx.fillRect(col * size, row * size, size, size);
                const piece = chessState.board[row][col];
                if (piece) {
                    ctx.fillStyle = piece === piece.toUpperCase() ? 'white' : 'black';
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(piece, col * size + size / 2, row * size + size / 2);
                }
            }
        }

        // Highlight selected piece
        if (chessState.selected) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 4;
            ctx.strokeRect(chessState.selected.col * size, chessState.selected.row * size, size, size);
        }

        elements.gameMessage.textContent = chessState.gameOver ? 'Game Over!' : `Player ${chessState.currentPlayer}'s turn`;
    }

    // Chess Move Logic (Simplified)
    function isValidChessMove(fromRow, fromCol, toRow, toCol) {
        const piece = chessState.board[fromRow][fromCol];
        if (!piece) return false;
        const isWhite = piece === piece.toUpperCase();
        if ((chessState.currentPlayer === 'white' && !isWhite) || (chessState.currentPlayer === 'black' && isWhite)) {
            return false;
        }
        // Basic move validation (not full chess rules)
        const dx = Math.abs(toCol - fromCol);
        const dy = Math.abs(toRow - fromRow);
        const target = chessState.board[toRow][toCol];
        if (target && (target === target.toUpperCase()) === isWhite) {
            return false;
        }
        switch (piece.toLowerCase()) {
            case 'p': // Pawn
                return dy === 1 && dx === 0 && !target && ((isWhite && toRow < fromRow) || (!isWhite && toRow > fromRow));
            case 'r': // Rook
                return (dx === 0 || dy === 0) && !isPathBlocked(fromRow, fromCol, toRow, toCol);
            case 'n': // Knight
                return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
            case 'b': // Bishop
                return dx === dy && !isPathBlocked(fromRow, fromCol, toRow, toCol);
            case 'q': // Queen
                return (dx === dy || dx === 0 || dy === 0) && !isPathBlocked(fromRow, fromCol, toRow, toCol);
            case 'k': // King
                return dx <= 1 && dy <= 1;
            default:
                return false;
        }
    }

    function isPathBlocked(fromRow, fromCol, toRow, toCol) {
        const dx = toCol - fromCol;
        const dy = toRow - fromRow;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        const stepX = dx / steps;
        const stepY = dy / steps;
        let x = fromCol + stepX;
        let y = fromRow + stepY;
        for (let i = 1; i < steps; i++) {
            if (chessState.board[Math.round(y)][Math.round(x)]) {
                return true;
            }
            x += stepX;
            y += stepY;
        }
        return false;
    }

    // Initialize Checkers Board
    function initializeCheckersBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(''));
        for (let row = 0; row < 3; row++) {
            for (let col = (row % 2) ? 0 : 1; col < 8; col += 2) {
                board[row][col] = 'r';
            }
        }
        for (let row = 5; row < 8; row++) {
            for (let col = (row % 2) ? 0 : 1; col < 8; col += 2) {
                board[row][col] = 'b';
            }
        }
        checkersState.board = board;
        checkersState.currentPlayer = 'red';
        checkersState.selected = null;
        checkersState.gameOver = false;
    }

    // Draw Checkers Board
    function drawCheckersBoard() {
        if (!elements.checkersBoard) {
            showToast('Checkers board not found');
            return;
        }
        const ctx = elements.checkersBoard.getContext('2d');
        const size = elements.checkersBoard.width / 8;
        ctx.clearRect(0, 0, elements.checkersBoard.width, elements.checkersBoard.height);

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#fff' : '#000';
                ctx.fillRect(col * size, row * size, size, size);
                const piece = checkersState.board[row][col];
                if (piece) {
                    ctx.fillStyle = piece === 'r' ? 'red' : 'black';
                    ctx.beginPath();
                    ctx.arc(col * size + size / 2, row * size + size / 2, size / 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        if (checkersState.selected) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 4;
            ctx.strokeRect(checkersState.selected.col * size, checkersState.selected.row * size, size, size);
        }

        elements.gameMessage.textContent = checkersState.gameOver ? 'Game Over!' : `Player ${checkersState.currentPlayer}'s turn`;
    }

    // Checkers Move Logic (Simplified)
    function isValidCheckersMove(fromRow, fromCol, toRow, toCol) {
        const piece = checkersState.board[fromRow][fromCol];
        if (!piece || piece !== checkersState.currentPlayer[0]) return false;
        const dy = checkersState.currentPlayer === 'red' ? 1 : -1;
        const dx = Math.abs(toCol - fromCol);
        const dyActual = toRow - fromRow;
        if (dx === 1 && dyActual === dy) {
            return !checkersState.board[toRow][toCol];
        }
        if (dx === 2 && dyActual === 2 * dy) {
            const midRow = fromRow + dy;
            const midCol = fromCol + (toCol > fromCol ? 1 : -1);
            const opponent = checkersState.currentPlayer === 'red' ? 'b' : 'r';
            if (checkersState.board[midRow][midCol] === opponent) {
                return !checkersState.board[toRow][toCol];
            }
        }
        return false;
    }

    // Initialize Snake Game
    function initializeSnakeGame() {
        snakeState.snake = [{ x: 10, y: 10 }];
        snakeState.food = { x: 15, y: 15 };
        snakeState.dx = 1;
        snakeState.dy = 0;
        snakeState.score = 0;
        snakeState.gameOver = false;
        if (snakeState.interval) clearInterval(snakeState.interval);
    }

    // Draw Snake Game
    function drawSnakeGame() {
        if (!elements.snakeBoard) {
            showToast('Snake board not found');
            return;
        }
        const ctx = elements.snakeBoard.getContext('2d');
        const size = elements.snakeBoard.width / 20;
        ctx.clearRect(0, 0, elements.snakeBoard.width, elements.snakeBoard.height);

        // Draw grid
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, elements.snakeBoard.width, elements.snakeBoard.height);

        // Draw snake
        ctx.fillStyle = 'green';
        snakeState.snake.forEach(segment => {
            ctx.fillRect(segment.x * size, segment.y * size, size - 2, size - 2);
        });

        // Draw food
        ctx.fillStyle = 'red';
        ctx.fillRect(snakeState.food.x * size, snakeState.food.y * size, size - 2, size - 2);

        elements.gameMessage.textContent = snakeState.gameOver ? `Game Over! Score: ${snakeState.score}` : `Score: ${snakeState.score}`;
    }

    // Update Snake Game
    function updateSnakeGame() {
        if (snakeState.gameOver) return;
        const head = { x: snakeState.snake[0].x + snakeState.dx, y: snakeState.snake[0].y + snakeState.dy };
        
        // Check collision with walls
        if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20) {
            snakeState.gameOver = true;
            drawSnakeGame();
            return;
        }

        // Check collision with self
        if (snakeState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            snakeState.gameOver = true;
            drawSnakeGame();
            return;
        }

        snakeState.snake.unshift(head);

        // Check food collision
        if (head.x === snakeState.food.x && head.y === snakeState.food.y) {
            snakeState.score += 10;
            snakeState.food = {
                x: Math.floor(Math.random() * 20),
                y: Math.floor(Math.random() * 20)
            };
        } else {
            snakeState.snake.pop();
        }

        drawSnakeGame();
    }

    // Handle Snake Controls
    document.addEventListener('keydown', (e) => {
        if (!elements.snakeBoard || elements.snakeBoard.style.display !== 'block') return;
        switch (e.key) {
            case 'ArrowUp':
                if (snakeState.dy !== 1) { snakeState.dx = 0; snakeState.dy = -1; }
                break;
            case 'ArrowDown':
                if (snakeState.dy !== -1) { snakeState.dx = 0; snakeState.dy = 1; }
                break;
            case 'ArrowLeft':
                if (snakeState.dx !== 1) { snakeState.dx = -1; snakeState.dy = 0; }
                break;
            case 'ArrowRight':
                if (snakeState.dx !== -1) { snakeState.dx = 1; snakeState.dy = 0; }
                break;
        }
    });

    // Update Tic-Tac-Toe board
    function updateTicTacToeBoard() {
        if (!elements.ticTacToeBoard) {
            showToast('Tic-Tac-Toe board not found');
            return;
        }
        const cells = elements.ticTacToeBoard.querySelectorAll('.tic-tac-toe-cell');
        if (cells.length !== 9) {
            initializeTicTacToeBoard();
            return;
        }
        cells.forEach((cell, index) => {
            cell.textContent = ticTacToeState.board[index] || '';
            cell.disabled = !!ticTacToeState.board[index] || checkTicTacToeWinner();
        });
        if (!checkTicTacToeWinner()) {
            elements.gameMessage.textContent = `Player ${ticTacToeState.currentPlayer}'s turn`;
        }
    }

    // Check Tic-Tac-Toe winner
    function checkTicTacToeWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (ticTacToeState.board[a] &&
                ticTacToeState.board[a] === ticTacToeState.board[b] &&
                ticTacToeState.board[a] === ticTacToeState.board[c]) {
                elements.gameMessage.textContent = `Player ${ticTacToeState.board[a]} wins!`;
                return true;
            }
        }
        if (!ticTacToeState.board.includes('')) {
            elements.gameMessage.textContent = 'Draw!';
            return true;
        }
        return false;
    }

    // Reset Tic-Tac-Toe
    function resetTicTacToe() {
        ticTacToeState = {
            board: Array(9).fill(''),
            currentPlayer: 'X'
        };
        initializeTicTacToeBoard();
        updateTicTacToeBoard();
        showToast('Tic-Tac-Toe reset');
    }

    // Reset Chess
    function resetChess() {
        initializeChessBoard();
        drawChessBoard();
    }

    // Reset Checkers
    function resetCheckers() {
        initializeCheckersBoard();
        drawCheckersBoard();
    }

    // Reset Snake
    function resetSnake() {
        initializeSnakeGame();
        drawSnakeGame();
        if (snakeState.interval) clearInterval(snakeState.interval);
        snakeState.interval = setInterval(updateSnakeGame, 100);
    }

    // Load profile
    async function loadProfile() {
        try {
            const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}`);
            if (response.ok) {
                profileData = await response.json();
                localStorage.setItem('username', profileData.username);
                updateProfileView();
                await updateFriendsList();
                updateGroupsList();
            } else {
                const error = await response.json();
                showToast(error.error || `User not found: ${profileData.username}`);
                profileData.username = prompt('User not found. Enter a valid username:') || 'YourUsername';
                localStorage.setItem('username', profileData.username);
                await loadProfile();
            }
        } catch (error) {
            showToast('Error loading profile');
            console.error('Error loading profile:', error);
        }
    }

    // Load stories
    function loadStories() {
        if (!elements.storiesContainer) {
            showToast('Stories container not found');
            return;
        }
        elements.storiesContainer.innerHTML = '';
        stories.forEach(story => {
            const storyDiv = document.createElement('div');
            storyDiv.className = 'story';
            storyDiv.dataset.storyId = story.id;
            storyDiv.innerHTML = `
                <img src="${story.imageUrl}" alt="Story">
                <p>${story.username}</p>
            `;
            elements.storiesContainer.appendChild(storyDiv);
        });
    }

    // Load posts
    async function loadPosts(filter = 'all', value = '') {
        try {
            const response = await fetch(`http://localhost:5000/api/posts?filter=${filter}&value=${value}`);
            if (response.ok) {
                const posts = await response.json();
                elements.postsSection.innerHTML = '';
                posts.forEach(post => addPostToDOM(post));
            } else {
                showToast('Failed to load posts');
            }
        } catch (error) {
            showToast('Error loading posts');
            console.error(error);
        }
    }

    // Add post to DOM
    function addPostToDOM(post) {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.dataset.postId = post._id;
        postCard.dataset.username = post.username;
        postCard.dataset.group = post.group;
        postCard.innerHTML = `
            <div class="post-header">
                <span class="post-username">${post.username}</span>
                <span class="post-tag">${post.tag}</span>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.image ? `<div class="post-image-container"><img src="http://localhost:5000${post.image}" alt="Post Image"></div>` : ''}
            <div class="post-reactions">
                <button class="reaction-btn like-btn" data-liked="${post.likes.includes(profileData.username)}"><i class="fas fa-heart"></i> <span class="like-count">${post.likes.length}</span></button>
                <button class="reaction-btn dislike-btn" data-disliked="${post.dislikes.includes(profileData.username)}"><i class="fas fa-thumbs-down"></i> <span class="dislike-count">${post.dislikes.length}</span></button>
                <button class="reaction-btn comment-btn"><i class="fas fa-comment"></i> <span class="comment-count">${post.comments.length}</span></button>
            </div>
            <div class="post-comments">
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <span class="comment-username">${comment.username}</span>: ${comment.text}
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input">
                    <input type="text" class="comment-text" placeholder="Add a comment...">
                    <button class="submit-comment"><i class="fas fa-paper-plane"></i> Post</button>
                </div>
            </div>
            <button class="follow-btn"><i class="fas fa-user-plus"></i> Follow</button>
        `;
        elements.postsSection.prepend(postCard);
    }

    // Filter posts
    function filterPosts(filter) {
        const posts = elements.postsSection.querySelectorAll('.post-card');
        posts.forEach(post => {
            const username = post.dataset.username;
            const group = post.dataset.group;
            if (filter === 'all') {
                post.style.display = 'block';
            } else if (filter === 'friends' && profileData.friends.includes(username)) {
                post.style.display = 'block';
            } else if (filter === 'groups' && profileData.groups.includes(group)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const section = link.getAttribute('href').substring(1);
            elements.homeSection.style.display = 'none';
            elements.aboutSection.style.display = 'none';
            elements.discussionsSection.style.display = 'none';
            elements.friendsSection.style.display = 'none';
            elements.groupsSection.style.display = 'none';
            elements.gamesSection.style.display = 'none';
            elements.messagesSection.style.display = 'none';
            elements.profileSection.style.display = 'none';
            if (section === 'home') {
                elements.homeSection.style.display = 'block';
                loadPosts();
            } else if (section === 'about') {
                elements.aboutSection.style.display = 'block';
            } else if (section === 'discussions') {
                elements.discussionsSection.style.display = 'block';
                updateDiscussions();
            } else if (section === 'friends') {
                elements.friendsSection.style.display = 'block';
                updateFriendsList();
            } else if (section === 'groups') {
                elements.groupsSection.style.display = 'block';
                updateGroupsList();
            } else if (section === 'games') {
                elements.gamesSection.style.display = 'block';
                elements.gameBoard.style.display = 'none';
                if (snakeState.interval) clearInterval(snakeState.interval);
            } else if (section === 'messages') {
                elements.messagesSection.style.display = 'block';
                updateConversationList();
            }
        });
    });

    // Profile Page
    elements.changeProfileBtn && elements.changeProfileBtn.addEventListener('click', () => {
        elements.homeSection.style.display = 'none';
        elements.aboutSection.style.display = 'none';
        elements.discussionsSection.style.display = 'none';
        elements.friendsSection.style.display = 'none';
        elements.groupsSection.style.display = 'none';
        elements.gamesSection.style.display = 'none';
        elements.messagesSection.style.display = 'none';
        elements.profileSection.style.display = 'block';
        elements.navLinks.forEach(l => l.classList.remove('active'));
    });

    // Save Profile
    elements.saveProfileBtn && elements.saveProfileBtn.addEventListener('click', async () => {
        const username = elements.usernameInput.value.trim();
        const bio = elements.bioInput.value.trim();
        const profileDp = elements.profileDpInput.files[0];
        let changes = [];

        const formData = new FormData();
        if (username) {
            formData.append('username', username);
            changes.push('username');
        }
        if (bio) {
            formData.append('bio', bio);
            changes.push('bio');
        }
        if (profileDp) {
            if (profileData.prevProfileDpUrl && profileData.prevProfileDpUrl.startsWith('blob:')) {
                URL.revokeObjectURL(profileData.prevProfileDpUrl);
            }
            profileData.prevProfileDpUrl = URL.createObjectURL(profileDp);
            formData.append('profileDp', profileData.prevProfileDpUrl);
            changes.push('profile logo');
        }

        if (changes.length > 0) {
            try {
                const response = await fetch(`http://localhost:5000/api/profiles`, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateProfileView();
                    await updateFriendsList();
                    updateGroupsList();
                    showToast(`Updated ${changes.join(', ')}!`);
                    elements.usernameInput.value = '';
                    elements.bioInput.value = '';
                    elements.profileDpInput.value = '';
                } else {
                    showToast('Failed to update profile');
                }
            } catch (error) {
                showToast('Error updating profile');
                console.error(error);
            }
        } else {
            showToast('No changes made!');
        }
    });

    // Settings Modal
    elements.settingsBtn && elements.settingsBtn.addEventListener('click', () => {
        if (!elements.settingsModal) {
            showToast('Settings modal not found');
            return;
        }
        elements.settingsModal.style.display = 'block';
    });

    elements.saveSettingsBtn && elements.saveSettingsBtn.addEventListener('click', () => {
        const theme = elements.themeSelect.value;
        document.body.classList.toggle('dark-mode', theme === 'dark');
        elements.settingsModal.style.display = 'none';
        showToast('Settings saved!');
    });

    // Switch User Modal
    elements.switchUserBtn && elements.switchUserBtn.addEventListener('click', () => {
        if (!elements.switchUserModal) {
            showToast('Switch user modal not found');
            return;
        }
        elements.switchUsernameInput.value = '';
        elements.switchUserModal.style.display = 'block';
    });

    // Submit Switch User
    elements.submitSwitchUserBtn && elements.submitSwitchUserBtn.addEventListener('click', async () => {
        const newUsername = elements.switchUsernameInput.value.trim();
        if (!newUsername) {
            showToast('Please enter a username!');
            return;
        }
        if (newUsername === profileData.username) {
            showToast('You are already logged in as this user!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/profiles/${newUsername}`);
            if (response.ok) {
                profileData = await response.json();
                localStorage.setItem('username', profileData.username);
                updateProfileView();
                await updateFriendsList();
                updateGroupsList();
                updateConversationList();
                loadPosts();
                loadStories();
                updateDiscussions();
                elements.switchUserModal.style.display = 'none';
                elements.switchUsernameInput.value = '';
                showToast(`Switched to user: ${profileData.username}`);
            } else {
                const error = await response.json();
                showToast(error.error || `User not found: ${newUsername}`);
            }
        } catch (error) {
            showToast('Error switching user');
            console.error('Error switching user:', error);
        }
    });

    // Post Modal
    elements.openPostModalBtn && elements.openPostModalBtn.addEventListener('click', () => {
        if (!elements.postModal) {
            showToast('Post modal not found');
            return;
        }
        elements.postModal.style.display = 'block';
    });

    elements.postImageInput && elements.postImageInput.addEventListener('change', () => {
        if (elements.postImageInput.files[0]) {
            elements.postImagePreview.src = URL.createObjectURL(elements.postImageInput.files[0]);
            elements.postImagePreview.style.display = 'block';
        } else {
            elements.postImagePreview.style.display = 'none';
        }
    });

    elements.submitPostBtn && elements.submitPostBtn.addEventListener('click', async () => {
        const postText = elements.postText.value.trim();
        const postImage = elements.postImageInput.files[0];
        const postGroup = elements.postGroupSelect.value;
        if (!postText && !postImage) {
            showToast('Please add text or an image!');
            return;
        }

        const formData = new FormData();
        formData.append('username', profileData.username);
        formData.append('content', postText);
        formData.append('group', postGroup);
        formData.append('tag', postGroup === 'none' ? 'Campus Buzz' : postGroup);
        if (postImage) {
            formData.append('image', postImage);
        }

        try {
            const response = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const post = await response.json();
                addPostToDOM(post);
                elements.postModal.style.display = 'none';
                elements.postText.value = '';
                elements.postImageInput.value = '';
                elements.postImagePreview.style.display = 'none';
                elements.postGroupSelect.value = 'none';
                showToast('Post created!');
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to create post');
            }
        } catch (error) {
            showToast('Error creating post');
            console.error(error);
        }
    });

    // Post Reactions and Comments
    elements.postsSection && elements.postsSection.addEventListener('click', async (e) => {
        const target = e.target.closest('.reaction-btn, .submit-comment');
        if (!target) return;
        const postCard = target.closest('.post-card');
        const postId = postCard.dataset.postId;

        if (target.classList.contains('like-btn')) {
            const liked = target.dataset.liked === 'true';
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: profileData.username }),
                });
                if (response.ok) {
                    const post = await response.json();
                    target.querySelector('.like-count').textContent = post.likes.length;
                    target.dataset.liked = !liked;
                    target.classList.toggle('active', !liked);
                    postCard.querySelector('.dislike-btn').querySelector('.dislike-count').textContent = post.dislikes.length;
                    postCard.querySelector('.dislike-btn').dataset.disliked = post.dislikes.includes(profileData.username);
                    postCard.querySelector('.dislike-btn').classList.toggle('active', post.dislikes.includes(profileData.username));
                    showToast(liked ? 'Like removed!' : 'Post liked!');
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Failed to like post');
                }
            } catch (error) {
                showToast('Error liking post');
                console.error(error);
            }
        } else if (target.classList.contains('dislike-btn')) {
            const disliked = target.dataset.disliked === 'true';
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${postId}/dislike`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: profileData.username }),
                });
                if (response.ok) {
                    const post = await response.json();
                    target.querySelector('.dislike-count').textContent = post.dislikes.length;
                    target.dataset.disliked = !disliked;
                    target.classList.toggle('active', !disliked);
                    postCard.querySelector('.like-btn').querySelector('.like-count').textContent = post.likes.length;
                    postCard.querySelector('.like-btn').dataset.liked = post.likes.includes(profileData.username);
                    postCard.querySelector('.like-btn').classList.toggle('active', post.likes.includes(profileData.username));
                    showToast(disliked ? 'Dislike removed!' : 'Post disliked!');
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Failed to dislike post');
                }
            } catch (error) {
                showToast('Error disliking post');
                console.error(error);
            }
        } else if (target.classList.contains('submit-comment')) {
            const commentText = postCard.querySelector('.comment-text').value.trim();
            if (!commentText) {
                showToast('Please enter a comment!');
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: profileData.username, text: commentText }),
                });
                if (response.ok) {
                    const post = await response.json();
                    const comment = document.createElement('div');
                    comment.className = 'comment';
                    comment.innerHTML = `<span class="comment-username">${profileData.username}</span>: ${commentText}`;
                    postCard.querySelector('.comments-list').appendChild(comment);
                    postCard.querySelector('.comment-count').textContent = post.comments.length;
                    postCard.querySelector('.comment-text').value = '';
                    showToast('Comment added!');
                } else {
                    const error = await response.json();
                    showToast(error.error || 'Failed to add comment');
                }
            } catch (error) {
                showToast('Error adding comment');
                console.error(error);
            }
        }
    });

    // Filter Buttons
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            let value = '';
            if (filter === 'friends') {
                value = profileData.friends.join(',');
            } else if (filter === 'groups') {
                value = profileData.groups[0] || '';
            }
            loadPosts(filter, value);
            filterPosts(filter);
        });
    });

    // Friends Modal
    elements.addFriendBtn && elements.addFriendBtn.addEventListener('click', () => {
        if (!elements.friendModal) {
            showToast('Friend modal not found');
            return;
        }
        elements.friendModal.style.display = 'block';
    });

    // Add Friend
    elements.submitFriendBtn && elements.submitFriendBtn.addEventListener('click', async () => {
        if (!elements.friendUsernameInput) {
            showToast('Friend username input missing');
            return;
        }
        const friendUsername = elements.friendUsernameInput.value.trim();
        if (!friendUsername) {
            showToast('Please enter a username!');
            return;
        }
        if (friendUsername === profileData.username) {
            showToast('You cannot add yourself!');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user1: profileData.username, user2: friendUsername })
            });
            if (response.ok) {
                await updateFriendsList();
                elements.friendModal.style.display = 'none';
                elements.friendUsernameInput.value = '';
                showToast('Friend added!');
            } else {
                const error = await response.json();
                showToast(error.error || 'Failed to add friend');
            }
        } catch (error) {
            showToast('Error adding friend');
            console.error('Error adding friend:', error);
        }
    });

    // Remove Friend
    elements.friendsList && elements.friendsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-friend-btn')) {
            const friend = e.target.dataset.friend;
            try {
                const response = await fetch(`http://localhost:5000/api/friends/${profileData.username}/${friend}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    await updateFriendsList();
                    showToast('Friend removed!');
                } else {
                    showToast('Failed to remove friend');
                }
            } catch (error) {
                showToast('Error removing friend');
                console.error('Error removing friend:', error);
            }
        }
    });

    // Groups Modal
    elements.manageGroupBtn && elements.manageGroupBtn.addEventListener('click', () => {
        if (!elements.groupModal) {
            showToast('Group modal not found');
            return;
        }
        elements.groupModal.style.display = 'block';
    });

    // Create Group
    elements.createGroupBtn && elements.createGroupBtn.addEventListener('click', () => {
        if (!elements.groupNameInput) {
            showToast('Group name input missing');
            return;
        }
        const groupName = elements.groupNameInput.value.trim();
        if (!groupName) {
            showToast('Please enter a group name!');
            return;
        }
        if (profileData.groups.includes(groupName)) {
            showToast('You’re already in this group!');
            return;
        }

        profileData.groups.push(groupName);
        if (!mockGroupNames.includes(groupName)) {
            mockGroupNames.push(groupName);
        }
        updateGroupsList();
        elements.groupModal.style.display = 'none';
        elements.groupNameInput.value = '';
        showToast('Group created!');
    });

    // Join Group
    elements.joinGroupBtn && elements.joinGroupBtn.addEventListener('click', () => {
        if (!elements.groupNameInput) {
            showToast('Group name input missing');
            return;
        }
        const groupName = elements.groupNameInput.value.trim();
        if (!groupName) {
            showToast('Please enter a group name!');
            return;
        }
        if (profileData.groups.includes(groupName)) {
            showToast('You’re already in this group!');
            return;
        }
        if (!mockGroupNames.includes(groupName)) {
            showToast('Group not found! Try StudyGroup, ChillZone, etc.');
            return;
        }

        profileData.groups.push(groupName);
        updateGroupsList();
        elements.groupModal.style.display = 'none';
        elements.groupNameInput.value = '';
        showToast('Joined group!');
    });

    // Leave Group
    elements.groupsList && elements.groupsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('leave-group-btn')) {
            const group = e.target.dataset.group;
            profileData.groups = profileData.groups.filter(g => g !== group);
            updateGroupsList();
            showToast('Left group!');
        }
    });

    // Story Modal
    elements.openStoryModalBtn && elements.openStoryModalBtn.addEventListener('click', () => {
        if (!elements.storyModal) {
            showToast('Story modal not found');
            return;
        }
        elements.storyModal.style.display = 'block';
    });

    // Submit Story
    elements.submitStoryBtn && elements.submitStoryBtn.addEventListener('click', () => {
        if (!elements.storyImageInput) {
            showToast('Story image input missing');
            return;
        }
        const storyImage = elements.storyImageInput.files[0];
        if (!storyImage) {
            showToast('Please select an image!');
            return;
        }
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(storyImage.type)) {
            showToast('Please select a valid image (JPEG, PNG, GIF)!');
            return;
        }
        if (storyImage.size > 5 * 1024 * 1024) {
            showToast('Image size must be less than 5MB!');
            return;
        }

        const imageUrl = URL.createObjectURL(storyImage);
        stories.push({
            id: Date.now().toString(),
            username: profileData.username,
            imageUrl
        });
        loadStories();
        elements.storyModal.style.display = 'none';
        elements.storyImageInput.value = '';
        showToast('Story added!');
    });

    // Open Story
    elements.storiesContainer && elements.storiesContainer.addEventListener('click', (e) => {
        const storyElement = e.target.closest('.story');
        if (!storyElement) return;
        if (!elements.storyViewer || !elements.storyContent || !elements.storyProgressBar) {
            showToast('Story viewer elements missing');
            return;
        }
        const storyId = storyElement.dataset.storyId;
        const storyData = stories.find(s => s.id === storyId);
        if (!storyData) {
            showToast('Story not found');
            return;
        }

        elements.storyContent.src = storyData.imageUrl;
        elements.storyViewer.style.display = 'flex';
        elements.storyProgressBar.style.width = '0%';
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            elements.storyProgressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                elements.storyViewer.style.display = 'none';
                elements.storyProgressBar.style.width = '0%';
            }
        }, 100);

        elements.storyViewer.addEventListener('click', () => {
            clearInterval(interval);
            elements.storyViewer.style.display = 'none';
            elements.storyProgressBar.style.width = '0%';
        }, { once: true });
    });

    // Tic-Tac-Toe Click
    elements.ticTacToeBoard && elements.ticTacToeBoard.addEventListener('click', (e) => {
        const cell = e.target.closest('.tic-tac-toe-cell');
        if (!cell || cell.disabled) return;
        const index = parseInt(cell.dataset.index);
        if (isNaN(index) || index < 0 || index > 8) {
            showToast('Invalid cell');
            return;
        }
        ticTacToeState.board[index] = ticTacToeState.currentPlayer;
        ticTacToeState.currentPlayer = ticTacToeState.currentPlayer === 'X' ? 'O' : 'X';
        updateTicTacToeBoard();
    });

    // Chess Click
    elements.chessBoard && elements.chessBoard.addEventListener('click', (e) => {
        if (chessState.gameOver) return;
        const rect = elements.chessBoard.getBoundingClientRect();
        const size = elements.chessBoard.width / 8;
        const col = Math.floor((e.clientX - rect.left) / size);
        const row = Math.floor((e.clientY - rect.top) / size);
        if (row < 0 || row > 7 || col < 0 || col > 7) return;

        if (chessState.selected) {
            if (isValidChessMove(chessState.selected.row, chessState.selected.col, row, col)) {
                chessState.board[row][col] = chessState.board[chessState.selected.row][chessState.selected.col];
                chessState.board[chessState.selected.row][chessState.selected.col] = '';
                chessState.currentPlayer = chessState.currentPlayer === 'white' ? 'black' : 'white';
                chessState.selected = null;
                // Simplified win condition
                if (!chessState.board.some(row => row.includes('k') && row.includes('K'))) {
                    chessState.gameOver = true;
                }
            } else {
                showToast('Invalid move');
                chessState.selected = null;
            }
        } else {
            if (chessState.board[row][col]) {
                chessState.selected = { row, col };
            }
        }
        drawChessBoard();
    });

    // Checkers Click
    elements.checkersBoard && elements.checkersBoard.addEventListener('click', (e) => {
        if (checkersState.gameOver) return;
        const rect = elements.checkersBoard.getBoundingClientRect();
        const size = elements.checkersBoard.width / 8;
        const col = Math.floor((e.clientX - rect.left) / size);
        const row = Math.floor((e.clientY - rect.top) / size);
        if (row < 0 || row > 7 || col < 0 || col > 7) return;

        if (checkersState.selected) {
            if (isValidCheckersMove(checkersState.selected.row, checkersState.selected.col, row, col)) {
                checkersState.board[row][col] = checkersState.board[checkersState.selected.row][checkersState.selected.col];
                checkersState.board[checkersState.selected.row][checkersState.selected.col] = '';
                const dx = Math.abs(col - checkersState.selected.col);
                if (dx === 2) {
                    const midRow = checkersState.selected.row + (row > checkersState.selected.row ? 1 : -1);
                    const midCol = checkersState.selected.col + (col > checkersState.selected.col ? 1 : -1);
                    checkersState.board[midRow][midCol] = '';
                }
                checkersState.currentPlayer = checkersState.currentPlayer === 'red' ? 'black' : 'red';
                checkersState.selected = null;
                // Simplified win condition
                const opponent = checkersState.currentPlayer === 'red' ? 'b' : 'r';
                if (!checkersState.board.some(row => row.includes(opponent))) {
                    checkersState.gameOver = true;
                }
            } else {
                showToast('Invalid move');
                checkersState.selected = null;
            }
        } else {
            if (checkersState.board[row][col]) {
                checkersState.selected = { row, col };
            }
        }
        drawCheckersBoard();
    });

    // Reset Games
    elements.resetTicTacToeBtn && elements.resetTicTacToeBtn.addEventListener('click', resetTicTacToe);
    elements.resetChessBtn && elements.resetChessBtn.addEventListener('click', resetChess);
    elements.resetCheckersBtn && elements.resetCheckersBtn.addEventListener('click', resetCheckers);
    elements.resetSnakeBtn && elements.resetSnakeBtn.addEventListener('click', resetSnake);

    // Other Games
    document.querySelectorAll('.game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.game;
            elements.gameBoard.style.display = 'block';
            elements.ticTacToeBoard.style.display = 'none';
            elements.chessBoard.style.display = 'none';
            elements.checkersBoard.style.display = 'none';
            elements.snakeBoard.style.display = 'none';
            elements.gameMessage.textContent = '';
            if (snakeState.interval) clearInterval(snakeState.interval);

            if (game === 'tic-tac-toe') {
                elements.ticTacToeBoard.style.display = 'block';
                resetTicTacToe();
                showToast('Started Tic-Tac-Toe');
            } else if (game === 'chess') {
                elements.chessBoard.style.display = 'block';
                resetChess();
                showToast('Started Chess');
            } else if (game === 'checkers') {
                elements.checkersBoard.style.display = 'block';
                resetCheckers();
                showToast('Started Checkers');
            } else if (game === 'snake') {
                elements.snakeBoard.style.display = 'block';
                resetSnake();
                showToast('Started Snake');
            } else {
                elements.gameBoard.style.display = 'none';
                showToast(`${game} is not implemented yet!`);
            }
        });
    });

    // DM Conversation Click
    elements.conversationList && elements.conversationList.addEventListener('click', (e) => {
        const conversation = e.target.closest('.conversation');
        if (!conversation) return;
        document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
        conversation.classList.add('active');
        const user = conversation.dataset.user;
        updateChatWindow(user);
        showToast(`Selected conversation with ${user}`);
    });

    // Send DM
    elements.sendDmBtn && elements.sendDmBtn.addEventListener('click', async () => {
        if (!elements.dmText) {
            showToast('Message input missing');
            return;
        }
        const message = elements.dmText.value.trim();
        if (!message) {
            showToast('Please enter a message!');
            return;
        }
        if (!currentConversation) {
            showToast('Please select a conversation!');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: profileData.username,
                    receiver: currentConversation,
                    text: message
                })
            });
            if (response.ok) {
                elements.dmText.value = '';
                await updateChatWindow(currentConversation);
                showToast('Message sent!');
                // Mock reply
                setTimeout(async () => {
                    try {
                        await fetch('http://localhost:5000/api/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                sender: currentConversation,
                                receiver: profileData.username,
                                text: 'Got your message!'
                            })
                        });
                        await updateChatWindow(currentConversation);
                    } catch (error) {
                        console.error('Error sending mock reply:', error);
                    }
                }, 1000);
            } else {
                const error = await response.json();
                showToast(`Failed to send message: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            showToast('Error sending message');
            console.error('Error sending message:', error);
        }
    });

    // Send Discussion
    elements.sendDiscussionBtn && elements.sendDiscussionBtn.addEventListener('click', async () => {
        if (!elements.discussionText) {
            showToast('Discussion input missing');
            return;
        }
        const message = elements.discussionText.value.trim();
        if (!message) {
            showToast('Please enter a discussion message!');
            return;
        }
        const group = profileData.groups.length > 0 ? profileData.groups[0] : 'General';
        try {
            const response = await fetch('http://localhost:5000/api/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: profileData.username, text: message, group })
            });
            if (response.ok) {
                updateDiscussions();
                elements.discussionText.value = '';
                showToast('Discussion message sent!');
            } else {
                showToast('Failed to send discussion message');
            }
        } catch (error) {
            showToast('Error sending discussion message');
            console.error(error);
        }
    });

    // Modal Close
    elements.closeModal.forEach(close => {
        close.addEventListener('click', () => {
            close.closest('.modal').style.display = 'none';
        });
    });

    // Hamburger Menu
    elements.hamburgerMenu && elements.hamburgerMenu.addEventListener('click', () => {
        if (!elements.sidebar) {
            showToast('Sidebar not found');
            return;
        }
        elements.sidebar.classList.toggle('active');
        showToast('Toggled sidebar');
    });

    // Logout Button
    elements.logoutBtn && elements.logoutBtn.addEventListener('click', () => {
        showToast('Logging out...');
        setTimeout(() => {
            localStorage.removeItem('username');
            window.location.href = 'https://localhost:3000';
        }, 3000);
    });

    // Load initial data
    loadProfile();
    loadPosts();
    loadStories();
    updateDiscussions();
});