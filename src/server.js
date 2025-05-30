const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// Fix the Post model path:
const app =express();
const Post = require('./models/Post'); // <-- correct relative path assuming server.js is in src/
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/forum_db', {
  // useNewUrlParser and useUnifiedTopology are no longer needed with recent mongoose versions
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.error('MongoDB error:', err));

// Routes
app.get('/api/posts', async (req, res) => {
  try {
    console.log('Fetching posts...');
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log('Posts retrieved:', posts);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to load posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { content, link } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new Post({ content, link });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Failed to create post:', error);
    res.status(500).json({ message: 'Failed to create post. Please try again.' });
  }
});

// Start server
app.listen(5000, () => {
  console.log('😎 Server running on http://localhost:5000');
});
