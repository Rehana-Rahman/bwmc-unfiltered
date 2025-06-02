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

    // Profile data (fetched from backend)
    let profileData = {
        username: 'YourUsername', // Replace with authenticated user's username
        profileDp: 'https://via.placeholder.com/100',
        bio: 'Your bio goes here...',
        friends: [],
        groups: [],
        prevProfileDpUrl: null
    };

    let conversations = {}; // Store DMs for each user
    let discussionMessages = []; // Store discussion messages
    let currentConversation = null;

    // Toast Notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Update profile view
    function updateProfileView() {
        usernameView.textContent = profileData.username;
        profileDpView.src = profileData.profileDp;
        bioView.textContent = profileData.bio || 'No bio set.';
    }

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
        profileData.friends.forEach(friend => {
            const friendItem = document.createElement('div');
            friendItem.className = 'friend-item';
            friendItem.innerHTML = `
                <span>${friend}</span>
                <button class="remove-friend-btn" data-username="${friend}">Remove</button>
            `;
            friendsList.appendChild(friendItem);
        });
        // Update conversation list
        conversationList.innerHTML = '';
        profileData.friends.forEach(friend => {
            const conversation = document.createElement('div');
            conversation.className = 'conversation';
            conversation.dataset.user = friend;
            conversation.textContent = friend;
            conversationList.appendChild(conversation);
        });
    }

    // Update groups list
    function updateGroupsList() {
        groupsList.innerHTML = '';
        postGroupSelect.innerHTML = '<option value="none">No Group</option>';
        profileData.groups.forEach(group => {
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

    // Load profile from backend
    async function loadProfile() {
        try {
            const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}`);
            if (response.ok) {
                profileData = await response.json();
                updateProfileView();
                updateFriendsList();
                updateGroupsList();
            } else {
                showToast('Failed to load profile');
            }
        } catch (error) {
            showToast('Error loading profile');
            console.error(error);
        }
    }

    // Load discussions from backend
    async function loadDiscussions(group = 'General') {
        try {
            const response = await fetch(`http://localhost:5000/api/discussions?group=${group}`);
            if (response.ok) {
                discussionMessages = await response.json();
                updateDiscussionWindow();
            } else {
                showToast('Failed to load discussions');
            }
        } catch (error) {
            showToast('Error loading discussions');
            console.error(error);
        }
    }

    // Load conversations for a user
    async function loadConversations(user) {
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${profileData.username}/${user}`);
            if (response.ok) {
                conversations[user] = (await response.json()).map(msg => ({
                    type: msg.sender === profileData.username ? 'sent' : 'received',
                    text: msg.text
                }));
                updateChatWindow(user);
            } else {
                showToast('Failed to load conversation');
            }
        } catch (error) {
            showToast('Error loading conversation');
            console.error(error);
        }
    }

    // Load posts from backend
    async function loadPosts(filter = 'all', value = '') {
        try {
            const response = await fetch(`http://localhost:5000/api/posts?filter=${filter}&value=${value}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Failed to fetch posts');
            const posts = await response.json();
            postsSection.innerHTML = ''; // Clear existing posts
            posts.forEach(post => addPostToDOM(post));
        } catch (error) {
            showToast('Error loading posts');
            console.error(error);
        }
    }

    // Add a post to the DOM
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
                <button class="reaction-btn like-btn" data-liked="${post.likes.includes(profileData.username)}">❤️ <span class="like-count">${post.likes.length}</span></button>
                <button class="reaction-btn dislike-btn" data-disliked="${post.dislikes.includes(profileData.username)}">👎 <span class="dislike-count">${post.dislikes.length}</span></button>
                <button class="reaction-btn comment-btn">💬 <span class="comment-count">${post.comments.length}</span></button>
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
                    <button class="submit-comment">Post</button>
                </div>
            </div>
            <button class="follow-btn">Follow</button>
        `;
        postsSection.prepend(postCard);
    }

    // Filter posts (client-side fallback)
    function filterPosts(filter) {
        const posts = document.querySelectorAll('.post-card');
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
            if (section === 'home') {
                loadPosts();
            } else if (section === 'discussions') {
                loadDiscussions();
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

    // Save Profile
    saveProfileBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const bio = bioInput.value.trim();
        const profileDp = profileDpInput.files[0];
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
            formData.append('profileDp', profileData.prevProfileDpUrl); // Note: Use multer in backend for actual file upload
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
                    updateFriendsList();
                    updateGroupsList();
                    showToast(`Updated ${changes.join(', ')}!`);
                    usernameInput.value = '';
                    bioInput.value = '';
                    profileDpInput.value = '';
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

    submitPostBtn.addEventListener('click', async () => {
        const postText = document.getElementById('post-text').value.trim();
        const postImage = postImageInput.files[0];
        const postGroup = postGroupSelect.value;
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
                postModal.style.display = 'none';
                document.getElementById('post-text').value = '';
                postImageInput.value = '';
                postImagePreview.style.display = 'none';
                postGroupSelect.value = 'none';
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
    postsSection.addEventListener('click', async (e) => {
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
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
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
    addFriendBtn.addEventListener('click', () => {
        friendModal.style.display = 'flex';
    });

    submitFriendBtn.addEventListener('click', async () => {
        const username = friendUsernameInput.value.trim();
        if (username && !profileData.friends.includes(username) && username !== profileData.username) {
            try {
                const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}/friends`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ friendUsername: username })
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateFriendsList();
                    friendModal.style.display = 'none';
                    friendUsernameInput.value = '';
                    showToast('Friend added!');
                    if (!conversations[username]) {
                        conversations[username] = [];
                    }
                } else {
                    showToast('Failed to add friend');
                }
            } catch (error) {
                showToast('Error adding friend');
                console.error(error);
            }
        } else {
            showToast('Invalid or duplicate username!');
        }
    });

    // Remove Friend
    friendsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('remove-friend-btn')) {
            const username = e.target.dataset.username;
            try {
                const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}/friends`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ friendUsername: username })
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateFriendsList();
                    showToast('Friend removed!');
                } else {
                    showToast('Failed to remove friend');
                }
            } catch (error) {
                showToast('Error removing friend');
                console.error(error);
            }
        }
    });

    // Groups Modal
    manageGroupBtn.addEventListener('click', () => {
        groupModal.style.display = 'flex';
    });

    createGroupBtn.addEventListener('click', async () => {
        const groupName = groupNameInput.value.trim();
        if (groupName && !profileData.groups.includes(groupName)) {
            try {
                const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}/groups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ groupName })
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateGroupsList();
                    groupModal.style.display = 'none';
                    groupNameInput.value = '';
                    showToast('Group created!');
                } else {
                    showToast('Failed to create group');
                }
            } catch (error) {
                showToast('Error creating group');
                console.error(error);
            }
        } else {
            showToast('Invalid or duplicate group name!');
        }
    });

    joinGroupBtn.addEventListener('click', async () => {
        const groupName = groupNameInput.value.trim();
        if (groupName && !profileData.groups.includes(groupName)) {
            try {
                const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}/groups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ groupName })
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateGroupsList();
                    groupModal.style.display = 'none';
                    groupNameInput.value = '';
                    showToast('Joined group!');
                } else {
                    showToast('Failed to join group');
                }
            } catch (error) {
                showToast('Error joining group');
                console.error(error);
            }
        } else {
            showToast('Invalid or duplicate group name!');
        }
    });

    // Leave Group
    groupsList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('leave-group-btn')) {
            const group = e.target.dataset.group;
            try {
                const response = await fetch(`http://localhost:5000/api/profiles/${profileData.username}/groups`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ groupName: group })
                });
                if (response.ok) {
                    profileData = await response.json();
                    updateGroupsList();
                    showToast('Left group!');
                } else {
                    showToast('Failed to leave group');
                }
            } catch (error) {
                showToast('Error leaving group');
                console.error(error);
            }
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
            // Note: Consider adding a backend endpoint to save stories
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
            loadConversations(user);
        }
    });

    sendDmBtn.addEventListener('click', async () => {
        const message = dmText.value.trim();
        if (message && currentConversation) {
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
                    conversations[currentConversation].push({ type: 'sent', text: message });
                    updateChatWindow(currentConversation);
                    dmText.value = '';
                    showToast('Message sent!');
                    // Simulate reply for testing (remove in production)
                    setTimeout(async () => {
                        const reply = {
                            sender: currentConversation,
                            receiver: profileData.username,
                            text: 'Got your message!'
                        };
                        await fetch('http://localhost:5000/api/messages', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(reply)
                        });
                        conversations[currentConversation].push({ type: 'received', text: reply.text });
                        updateChatWindow(currentConversation);
                    }, 1000);
                } else {
                    showToast('Failed to send message');
                }
            } catch (error) {
                showToast('Error sending message');
                console.error(error);
            }
        } else {
            showToast('Please enter a message or select a conversation!');
        }
    });

    // Discussions
    sendDiscussionBtn.addEventListener('click', async () => {
        const message = discussionText.value.trim();
        if (message) {
            try {
                const response = await fetch('http://localhost:5000/api/discussions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: profileData.username,
                        text: message,
                        group: 'General'
                    })
                });
                if (response.ok) {
                    const msg = await response.json();
                    discussionMessages.push(msg);
                    updateDiscussionWindow();
                    discussionText.value = '';
                    showToast('Message sent!');
                    // Simulate reply for testing (remove in production)
                    setTimeout(async () => {
                        const reply = {
                            username: 'OtherUser',
                            text: `Re: ${message}`,
                            group: 'General',
                            timestamp: new Date().toISOString()
                        };
                        await fetch('http://localhost:5000/api/discussions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(reply)
                        });
                        discussionMessages.push(reply);
                        updateDiscussionWindow();
                    }, 1000);
                } else {
                    showToast('Failed to send message');
                }
            } catch (error) {
                showToast('Error sending message');
                console.error(error);
            }
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

    // Load initial data
    loadProfile();
    loadPosts();
});