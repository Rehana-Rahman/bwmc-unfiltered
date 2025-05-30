const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define Post schema/model if not already defined
const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  link: String,
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { content, link } = req.body;
    const post = new Post({ content, link });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;