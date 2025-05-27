const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/forum_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.error('MongoDB error:', err));

// Define a simple Post model
const Post = mongoose.model('Post', {
  content: String,
  link: String,
  createdAt: { type: Date, default: Date.now }
});

// Routes
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const { content, link } = req.body;
  const newPost = new Post({ content, link });
  await newPost.save();
  res.json(newPost);
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
