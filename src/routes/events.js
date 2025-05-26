const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events - Fetch all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

module.exports = router;