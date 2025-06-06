const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const Profile = require('../models/profile');

// Get friends for a user
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const friends = await Friend.find({
            $or: [{ user1: username }, { user2: username }]
        });
        const friendUsernames = friends.map(f => 
            f.user1 === username ? f.user2 : f.user1
        );
        res.json(friendUsernames);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Add friend
router.post('/', async (req, res) => {
    try {
        const { user1, user2 } = req.body;
        if (!user1 || !user2) return res.status(400).json({ error: 'Both usernames required' });
        if (user1 === user2) return res.status(400).json({ error: 'Cannot add yourself' });

        const profile1 = await Profile.findOne({ username: user1 });
        const profile2 = await Profile.findOne({ username: user2 });
        if (!profile1 || !profile2) return res.status(404).json({ error: 'User not found' });

        const exists = await Friend.findOne({
            $or: [
                { user1, user2 },
                { user1: user2, user2: user1 }
            ]
        });
        if (exists) return res.status(400).json({ error: 'Already friends' });

        const friend = new Friend({ user1, user2 });
        await friend.save();
        res.json({ user1, user2 });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove friend
router.delete('/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        await Friend.deleteOne({
            $or: [
                { user1, user2 },
                { user1: user2, user2: user1 }
            ]
        });
        res.json({ message: 'Friend removed' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;