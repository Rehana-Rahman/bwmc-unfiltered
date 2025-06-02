const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// Get all discussion messages (optionally filter by group)
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    const query = group ? { group } : {};
    const discussions = await Discussion.find(query).sort({ timestamp: 1 });
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a discussion message
router.post('/', async (req, res) => {
  try {
    const { username, text, group } = req.body;
    const discussion = new Discussion({ username, text, group });
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;