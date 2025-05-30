document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const changeProfileBtn = document.getElementById('change-profile-btn');
    const openPostModalBtn = document.getElementById('open-post-modal');
    const openStoryModalBtn = document.getElementById('open-story-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const postModal = document.getElementById('post-modal');
    const storyModal = document.getElementById('story-modal');
    const settingsModal = document.getElementById('settings-modal');
    const friendModal = document.getElementById('friend-modal');
    const groupModal = document.getElementById('group-modal');
    const closeModal = document.querySelectorAll('.close');
    const submitPostBtn = document.getElementById('submit-post');
    const submitStoryBtn = document.getElementById('submit-story');
    const saveSettingsBtn = document.getElementById('save-settings');
    const saveProfileBtn = document.getElementById('save-profile');
    const submitFriendBtn = document.getElementById('submit-friend');
    const createGroupBtn = document.getElementById('create-group');
    const joinGroupBtn = document.getElementById('join-group');
    const themeSelect = document.getElementById('theme-select');
    const usernameInput = document.getElementById('username');
    const profileDpInput = document.getElementById('profile-dp');
    const bioInput = document.getElementById('bio');
    const usernameView = document.getElementById('username-view');
    const profileDpView = document.getElementById('profile-dp-view');
    const bioView = document.getElementById('bio-view');
    const storiesContainer = document.querySelector('.stories-container');
    const storyViewer = document.getElementById('story-viewer');
    const storyContent = document.getElementById('story-content');
    const storyProgressBar = document.getElementById('story-progress-bar');
    const toast = document.querySelector('.toast');
    const navLinks = document.querySelectorAll('.nav-link');
    const homeSection = document.getElementById('home-section');
    const aboutSection = document.getElementById('about-section');
    const discussionsSection = document.getElementById('discussions-section');
    const friendsSection = document.getElementById('friends-section');
    const groupsSection = document.getElementById('groups-section');
    const messagesSection = document.getElementById('messages-section');
    const profileSection = document.getElementById('profile-section');
    const postsSection = document.querySelector('.posts');
    const sendDmBtn = document.getElementById('send-dm');
    const dmText = document.getElementById('dm-text');
    const dmList = document.querySelector('.dm-list');
    const conversationList = document.querySelector('.conversation-list');
    const chatUsername = document.getElementById('chat-username');
    const postImageInput = document.getElementById('post-image');
    const postImagePreview = document.getElementById('post-image-preview');
    const postGroupSelect = document.getElementById('post-group');
    const sendDiscussionBtn = document.getElementById('send-discussion');
    const discussionText = document.getElementById('discussion-text');
    const discussionList = document.querySelector('.discussion-list');
    const addStoryBtn = document.querySelector('.add-story-btn');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const manageGroupBtn = document.getElementById('manage-group-btn');
    const friendsList = document.querySelector('.friends-list');
    const groupsList = document.querySelector('.groups-list');
    const friendUsernameInput = document.getElementById('friend-username');
    const groupNameInput = document.getElementById('group-name');

    // Simulated data
    let profileData = {
        username: 'YourUsername',
        profileDp: 'https://via.placeholder.com/100',
        bio: 'Your bio goes here...',
        prevProfileDpUrl: null
    };

    let friends = ['User1'];
    let groups = [];
    let conversations = {
        'User1': [
            { type: 'sent', text: 'Hey, what\'s up?' },
            { type: 'received', text: 'Not much, just chilling!' }
        ],
        'User2': []
    };

    let discussionMessages = [];
    let postCounter = 2;
    let postReactions = { '1': { likes: 0, dislikes: 0, comments: [] } };

    // Simulated WebSocket for real-time discussions
    let socket = null;
    function initWebSocket() {
        socket = {
            send: (data) => {
                const message = JSON.parse(data);
                discussionMessages.push(message);
                updateDiscussionWindow();
                setTimeout(() => {
                    const reply = {
                        username: 'OtherUser',
                        text: `Re: ${message.text}`,
                        timestamp: new Date().toISOString()
                    };
                    discussionMessages.push(reply);
                    updateDiscussionWindow();
                }, 1000);
            },
            onmessage: null
        };
    }
    initWebSocket();

    // Update profile view
    function updateProfileView() {
        usernameView.textContent = profileData.username;
        profileDpView.src = profileData.profileDp;
        bioView.textContent = profileData.bio || 'No bio set.';
    }
    updateProfileView();

    // Update discussion window
    function updateDiscussionWindow() {
        discussionList.innerHTML = '';
        discussionMessages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `discussion-message ${msg.username === profileData.username ? 'sent' : 'received'}`;
            messageDiv.innerHTML = `
                <strong>${msg.username}</strong>: ${msg.text}
                <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
            `;
            discussionList.appendChild(messageDiv);
        });
        discussionList.scrollTop = discussionList.scrollHeight;
    }

    // Update friends list
    function updateFriendsList() {
        friendsList.innerHTML = '';
        friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.innerHTML = `
                <span>${friend}</span>
                <button class="remove-friend-btn" data-username="${friend}">Remove</button>
            `;
            friendsList.appendChild(friendItem);
        });
    }
    updateFriendsList();

    // Update groups list
    function updateGroupsList() {
        groupsList.innerHTML = '';
        postGroupSelect.innerHTML = '<option value="none">No Group</option>';
        groups.forEach(group => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            groupItem.innerHTML = `
                <span>${group}</span>
                <button class="leave-group-btn" data-group="${group}">Leave</button>
            `;
            groupsList.appendChild(groupItem);
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            postGroupSelect.appendChild(option);
        });
    }
    updateGroupsList();

    // Filter posts
    function filterPosts(filter) {
        const posts = document.querySelectorAll('.post-card');
        posts.forEach(post => {
            const username = post.dataset.username;
            const group = post.dataset.group;
            if (filter === 'all') {
                post.style.display = 'block';
            } else if (filter === 'friends' && friends.includes(username)) {
                post.style.display = 'block';
            } else if (filter === 'groups' && groups.includes(group)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const section = link.getAttribute('href').substring(1);
            homeSection.style.display = section === 'home' ? 'block' : 'none';
            aboutSection.style.display = section === 'about' ? 'block' : 'none';
            discussionsSection.style.display = section === 'discussions' ? 'block' : 'none';
            friendsSection.style.display = section === 'friends' ? 'block' : 'none';
            groupsSection.style.display = section === 'groups' ? 'block' : 'none';
            messagesSection.style.display = section === 'messages' ? 'block' : 'none';
            profileSection.style.display = 'none';
            if (section === 'discussions') {
                updateDiscussionWindow();
            } else if (section === 'friends') {
                updateFriendsList();
            } else if (section === 'groups') {
                updateGroupsList();
            }
        });
    });

    // Profile Page
    changeProfileBtn.addEventListener('click', () => {
        homeSection.style.display = 'none';
        aboutSection.style.display = 'none';
        discussionsSection.style.display = 'none';
        friendsSection.style.display = 'none';
        groupsSection.style.display = 'none';
        messagesSection.style.display = 'none';
        profileSection.style.display = 'block';
        navLinks.forEach(l => l.classList.remove('active'));
    });

    saveProfileBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const bio = bioInput.value.trim();
        const profileDp = profileDpInput.files[0];
        let changes = [];

        if (username) {
            profileData.username = username;
            changes.push('username');
        }
        if (bio) {
            profileData.bio = bio;
            changes.push('bio');
        }
        if (profileDp) {
            if (profileData.prevProfileDpUrl && profileData.prevProfileDpUrl.startsWith('blob:')) {
                URL.revokeObjectURL(profileData.prevProfileDp);
            }
            profileData.prevProfileDpUrl = URL.createObjectURL(profileDp);
            profileData.profileDp = profileData.prevProfileDpUrl;
            changes.push('profile logo');
        }

        if (changes.length > 0) {
            updateProfileView();
            showToast(`Updated ${changes.join(', ')}!`);
            usernameInput.value = '';
            bioInput.value = '';
            profileDpInput.value = '';
        } else {
            showToast('No changes made!');
        }
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });

    saveSettingsBtn.addEventListener('click', () => {
        const theme = themeSelect.value;
        document.body.classList.toggle('dark-mode', theme === 'dark');
        settingsModal.style.display = 'none';
        showToast('Settings saved!');
    });

    // Post Modal
    openPostModalBtn.addEventListener('click', () => {
        postModal.style.display = 'flex';
    });

    postImageInput.addEventListener('change', () => {
        if (postImageInput.files[0]) {
            postImagePreview.src = URL.createObjectURL(postImageInput.files[0]);
            postImagePreview.style.display = 'block';
        } else {
            postImagePreview.style.display = 'none';
        }
    });

    submitPostBtn.addEventListener('click', () => {
        const postText = document.getElementById('post-text').value.trim();
        const postImage = postImageInput.files[0];
        const postGroup = postGroupSelect.value;
        if (postText || postImage) {
            const postId = postCounter++;
            postReactions[postId] = { likes: 0, dislikes: 0, comments: [] };
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.dataset.postId = postId;
            postCard.dataset.username = profileData.username;
            postCard.dataset.group = postGroup;
            let imageHtml = '';
            if (postImage) {
                imageHtml = `<div class="post-image-container"><img src="${URL.createObjectURL(postImage)}" alt="Post Image"></div>`;
            }
            postCard.innerHTML = `
                <div class="post-header">
                    <span class="post-username">${profileData.username}</span>
                    <span class="post-tag">${postGroup === 'none' ? 'Campus Buzz' : postGroup}</span>
                </div>
                <div class="post-content">${postText}</div>
                ${imageHtml}
                <div class="post-reactions">
                    <button class="reaction-btn like-btn" data-liked="false">❤️ <span class="like-count">0</span></button>
                    <button class="reaction-btn dislike-btn" data-disliked="false">👎 <span class="dislike-count">0</span></button>
                    <button class="reaction-btn comment-btn">💬 <span class="comment-count">0</span></button>
                </div>
                <div class="post-comments">
                    <div class="comments-list"></div>
                    <div class="comment-input">
                        <input type="text" class="comment-text" placeholder="Add a comment...">
                        <button class="submit-comment">Post</button>
                    </div>
                </div>
                <button class="follow-btn">Follow</button>
            `;
            postsSection.prepend(postCard);
            postModal.style.display = 'none';
            document.getElementById('post-text').value = '';
            postImageInput.value = '';
            postImagePreview.style.display = 'none';
            postGroupSelect.value = 'none';
            showToast('Post created!');
        }
    });

    // Post Reactions and Comments
    postsSection.addEventListener('click', (e) => {
        const target = e.target.closest('.reaction-btn, .submit-comment');
        if (!target) return;
        const postCard = target.closest('.post-card');
        const postId = postCard.dataset.postId;

        if (target.classList.contains('like-btn')) {
            const liked = target.dataset.liked === 'true';
            target.dataset.liked = !liked;
            postReactions[postId].likes += liked ? -1 : 1;
            target.querySelector('.like-count').textContent = postReactions[postId].likes;
            target.classList.toggle('active', !liked);
        } else if (target.classList.contains('dislike-btn')) {
            const disliked = target.dataset.disliked === 'true';
            target.dataset.disliked = !disliked;
            postReactions[postId].dislikes += disliked ? -1 : 1;
            target.querySelector('.dislike-count').textContent = postReactions[postId].dislikes;
            target.classList.toggle('active', !disliked);
        } else if (target.classList.contains('submit-comment')) {
            const commentText = postCard.querySelector('.comment-text').value.trim();
            if (commentText) {
                postReactions[postId].comments.push(commentText);
                const comment = document.createElement('div');
                comment.className = 'comment';
                comment.textContent = `${profileData.username}: ${commentText}`;
                postCard.querySelector('.comments-list').appendChild(comment);
                postCard.querySelector('.comment-count').textContent = postReactions[postId].comments.length;
                postCard.querySelector('.comment-text').value = '';
                showToast('Comment added!');
            } else {
                showToast('Please enter a comment!');
            }
        }
    });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filterPosts(filter);
        });
    });

    // Friends Modal
    addFriendBtn.addEventListener('click', () => {
        friendModal.style.display = 'flex';
    });

    submitFriendBtn.addEventListener('click', () => {
        const username = friendUsernameInput.value.trim();
        if (username && !friends.includes(username) && username !== profileData.username) {
            friends.push(username);
            updateFriendsList();
            friendModal.style.display = 'none';
            friendUsernameInput.value = '';
            showToast('Friend added!');
            if (!conversations[username]) {
                conversations[username] = [];
            }
        } else {
            showToast('Invalid or duplicate username!');
        }
    });

    // Remove Friend
    friendsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-friend-btn')) {
            const username = e.target.dataset.username;
            friends = friends.filter(f => f !== username);
            updateFriendsList();
            showToast('Friend removed!');
        }
    });

    // Groups Modal
    manageGroupBtn.addEventListener('click', () => {
        groupModal.style.display = 'flex';
    });

    createGroupBtn.addEventListener('click', () => {
        const groupName = groupNameInput.value.trim();
        if (groupName && !groups.includes(groupName)) {
            groups.push(groupName);
            updateGroupsList();
            groupModal.style.display = 'none';
            groupNameInput.value = '';
            showToast('Group created!');
        } else {
            showToast('Invalid or duplicate group name!');
        }
    });

    joinGroupBtn.addEventListener('click', () => {
        const groupName = groupNameInput.value.trim();
        if (groupName && !groups.includes(groupName)) {
            groups.push(groupName);
            updateGroupsList();
            groupModal.style.display = 'none';
            groupNameInput.value = '';
            showToast('Joined group!');
        } else {
            showToast('Invalid or duplicate group name!');
        }
    });

    // Leave Group
    groupsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('leave-group-btn')) {
            const group = e.target.dataset.group;
            groups = groups.filter(g => g !== group);
            updateGroupsList();
            showToast('Left group!');
        }
    });

    // Story Modal
    openStoryModalBtn.addEventListener('click', () => {
        storyModal.style.display = 'flex';
    });

    addStoryBtn.addEventListener('click', () => {
        storyModal.style.display = 'flex';
    });

    submitStoryBtn.addEventListener('click', () => {
        const storyImage = document.getElementById('story-image').files[0];
        if (storyImage) {
            const story = document.createElement('div');
            story.className = 'story';
            const storyImgSrc = URL.createObjectURL(storyImage);
            story.innerHTML = `
                <img src="${storyImgSrc}" alt="Profile Story">
                <p>${profileData.username}</p>
            `;
            storiesContainer.appendChild(story);
            storyModal.style.display = 'none';
            document.getElementById('story-image').value = '';
            showToast('Story added!');
        }
    });

    // Story Viewer
    storiesContainer.addEventListener('click', (e) => {
        const story = e.target.closest('.story');
        if (story) {
            const imgSrc = story.querySelector('img').src;
            openStory(imgSrc);
        }
    });

    function openStory(imgSrc) {
        storyContent.src = imgSrc;
        storyViewer.style.display = 'flex';
        storyProgressBar.style.width = '0%';
        let progress = 0;
        let interval = setInterval(() => {
            progress += 1;
            storyProgressBar.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(interval);
                storyViewer.style.display = 'none';
            }
        }, 50);
        storyViewer.addEventListener('click', () => {
            clearInterval(interval);
            storyViewer.style.display = 'none';
            storyProgressBar.style.width = '0%';
        }, { once: true });
    }

    // Modal Close
    closeModal.forEach(close => {
        close.addEventListener('click', () => {
            close.parentElement.parentElement.style.display = 'none';
        });
    });

    // Messaging
    let currentConversation = null;

    function updateChatWindow(user) {
        currentConversation = user;
        chatUsername.textContent = user || 'Select a conversation';
        dmList.innerHTML = '';
        if (user && conversations[user]) {
            conversations[user].forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `dm-message ${msg.type}`;
                messageDiv.textContent = msg.text;
                dmList.appendChild(messageDiv);
            });
            dmList.scrollTop = dmList.scrollHeight;
        }
    }

    conversationList.addEventListener('click', (e) => {
        const conversation = e.target.closest('.conversation');
        if (conversation) {
            document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
            conversation.classList.add('active');
            const user = conversation.dataset.user;
            updateChatWindow(user);
        }
    });

    sendDmBtn.addEventListener('click', () => {
        const message = dmText.value.trim();
        if (message && currentConversation) {
            conversations[currentConversation].push({ type: 'sent', text: message });
            const messageDiv = document.createElement('div');
            messageDiv.className = 'dm-message sent';
            messageDiv.textContent = message;
            dmList.appendChild(messageDiv);
            dmList.scrollTop = dmList.scrollHeight;
            dmText.value = '';
            showToast('Message sent!');
            setTimeout(() => {
                conversations[currentConversation].push({ type: 'received', text: 'Got your message!' });
                const replyDiv = document.createElement('div');
                replyDiv.className = 'dm-message received';
                replyDiv.textContent = 'Got your message!';
                dmList.appendChild(replyDiv);
                dmList.scrollTop = dmList.scrollHeight;
            }, 1000);
        }
    });

    // Discussions
    sendDiscussionBtn.addEventListener('click', () => {
        const message = discussionText.value.trim();
        if (message) {
            const msgObj = {
                username: profileData.username,
                text: message,
                timestamp: new Date().toISOString()
            };
            socket.send(JSON.stringify(msgObj));
            discussionText.value = '';
            showToast('Message sent!');
        } else {
            showToast('Please enter a message!');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        showToast('Logging out...');
        setTimeout(() => {
            window.location.href = 'http://localhost:3000/';
        }, 3000);
    });

    // Toast Notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});