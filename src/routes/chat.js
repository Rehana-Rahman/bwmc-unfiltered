const express = require('express');
const { pool } = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  try {
    await pool.query('INSERT INTO chats (sender_id, receiver_id, message) VALUES (?, ?, ?)', [senderId, receiverId, message]);
    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [messages] = await pool.query(`
      SELECT c.*, u1.username AS sender, u2.username AS receiver 
      FROM chats c 
      JOIN users u1 ON c.sender_id = u1.id 
      JOIN users u2 ON c.receiver_id = u2.id 
      WHERE c.sender_id = ? OR c.receiver_id = ?
    `, [userId, userId]);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;