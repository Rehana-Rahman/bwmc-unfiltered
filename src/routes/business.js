const express = require('express');
const { pool } = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, description, link, userId } = req.body;
  try {
    await pool.query('INSERT INTO businesses (user_id, name, description, link) VALUES (?, ?, ?, ?)', [userId, name, description, link]);
    res.status(201).json({ message: 'Business promoted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote business' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [businesses] = await pool.query(`
      SELECT b.*, u.username 
      FROM businesses b 
      JOIN users u ON b.user_id = u.id
    `);
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

module.exports = router;