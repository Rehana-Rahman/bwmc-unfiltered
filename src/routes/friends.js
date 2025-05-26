const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated (assuming authRoutes provides this)
const authMiddleware = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// POST /api/friends - Add a friend
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { friendUsername } = req.body;
    const user = await User.findOne({ username: req.user.username });
    const friend = await User.findOne({ username: friendUsername });
    if (!friend) return res.status(404).json({ error: 'Friend not found' });
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: 'Friend already added' });
    }
    user.friends.push(friend._id);
    await user.save();
    res.json({ message: 'Friend added successfully' });
  } catch (error) {
    console.error('Error adding friend:', error.message);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

module.exports = router;