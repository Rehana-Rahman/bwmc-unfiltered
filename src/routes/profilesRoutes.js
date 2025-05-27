const express = require('express');
const router = express.Router();
const Profile = require('./models/Profile');

// Get Profile
router.get('/api/profile/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Add Friend
router.post('/api/profile/:username/add-friend', async (req, res) => {
  const friendUsername = req.body.friendUsername;
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ error: "User not found" });

    if (!profile.friends.includes(friendUsername)) {
      profile.friends.push(friendUsername);
      await profile.save();
    }

    res.json({ message: "Friend added", friends: profile.friends });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;