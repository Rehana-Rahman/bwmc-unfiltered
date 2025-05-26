const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');

// Add a comment to a post
router.post('/', async (req, res) => {
  const { postId, userId, content } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const comment = { userId, content, createdAt: new Date() };
    post.comments = post.comments || [];
    post.comments.push(comment);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
