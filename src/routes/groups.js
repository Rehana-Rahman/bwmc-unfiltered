const express = require('express');
const { pool } = require('../database');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, userId } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO groups (name, creator_id) VALUES (?, ?)', [name, userId]);
    await pool.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [result.insertId, userId]);
    res.status(201).json({ message: 'Group created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [groups] = await pool.query(`
      SELECT g.*, u.username AS creator 
      FROM groups g 
      JOIN users u ON g.creator_id = u.id
    `);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

module.exports = router;