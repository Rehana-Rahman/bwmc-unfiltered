const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  username: String,
  content: String,
  group: String,
  tag: String,
  image: String,
  likes: [String],
  dislikes: [String],
  comments: [
    {
      username: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
