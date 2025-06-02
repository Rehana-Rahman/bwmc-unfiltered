const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/Post');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// POST a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const post = new Post({
      username: req.body.username,
      content: req.body.content,
      group: req.body.group || 'none',
      tag: req.body.tag || 'Campus Buzz',
      image: req.file ? `/uploads/${req.file.filename}` : null,
      likes: [],
      dislikes: [],
      comments: []
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like post
router.post('/:id/like', async (req, res) => {
  const post = await Post.findById(req.params.id);
  const user = req.body.username;
  post.likes = post.likes.includes(user) ? post.likes.filter(u => u !== user) : [...post.likes, user];
  post.dislikes = post.dislikes.filter(u => u !== user);
  await post.save();
  res.json(post);
});

// Dislike post
router.post('/:id/dislike', async (req, res) => {
  const post = await Post.findById(req.params.id);
  const user = req.body.username;
  post.dislikes = post.dislikes.includes(user) ? post.dislikes.filter(u => u !== user) : [...post.dislikes, user];
  post.likes = post.likes.filter(u => u !== user);
  await post.save();
  res.json(post);
});

// Comment on post
router.post('/:id/comments', async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.comments.push({ username: req.body.username, text: req.body.text });
  await post.save();
  res.json(post);
});

module.exports = router;
