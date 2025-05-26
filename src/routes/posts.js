const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

// Create a new post
router.post('/', async (req, res) => {
  const { content, link, userId } = req.body;
  try {
    const post = await Post.create({ content, link, userId, likes: 0, shares: 0 });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.status(200).json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch trending posts
router.get('/trending', async (req, res) => {
  try {
    const posts = await Post.find().sort({ likes: -1 }).limit(10);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;