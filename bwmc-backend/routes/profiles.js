const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Get profile by username
router.get('/:username', async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create or update profile
router.post('/', upload.single('profileDp'), async (req, res) => {
    try {
        const { username, bio } = req.body;
        let profile = await Profile.findOne({ username });

        if (profile) {
            // Update existing profile
            profile.bio = bio || profile.bio;
            if (req.file) {
                profile.profileDp = `/Uploads/${req.file.filename}`;
            }
            await profile.save();
        } else {
            // Create new profile
            profile = new Profile({
                username,
                bio,
                profileDp: req.file ? `/Uploads/${req.file.filename}` : 'https://via.placeholder.com/100'
            });
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add friend
router.post('/:username/friends', async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        const { friendUsername } = req.body;
        if (!profile.friends.includes(friendUsername)) {
            profile.friends.push(friendUsername);
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove friend
router.delete('/:username/friends', async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        const { friendUsername } = req.body;
        profile.friends = profile.friends.filter(f => f !== friendUsername);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Error removing friend:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add group
router.post('/:username/groups', async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        const { groupName } = req.body;
        if (!profile.groups.includes(groupName)) {
            profile.groups.push(groupName);
            await profile.save();
        }
        res.json(profile);
    } catch (err) {
        console.error('Error adding group:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove group
router.delete('/:username/groups', async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: 'Profile not found' });
        const { groupName } = req.body;
        profile.groups = profile.groups.filter(g => g !== groupName);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error('Error removing group:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;