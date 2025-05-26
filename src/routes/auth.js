const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const router = express.Router();

// Route to serve the login page
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/register', async (req, res) => {
  const { username, password, bio } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, bio });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id, username: user.username }, 'secret_key', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;