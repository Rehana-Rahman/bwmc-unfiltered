import { Router } from 'express';
const router = Router();
import { find } from '../models/Event';

// GET /api/events - Fetch all events
router.get('/', async (req, res) => {
  try {
    const events = await find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

export default router;