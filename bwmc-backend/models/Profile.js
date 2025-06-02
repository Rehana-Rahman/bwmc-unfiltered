const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profileDp: {
    type: String,
    default: 'https://via.placeholder.com/100' // Default profile picture
  },
  bio: {
    type: String,
    default: 'No bio set.',
    trim: true
  },
  friends: [{
    type: String // Store usernames of friends
  }],
  groups: [{
    type: String // Store group names
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('profile', ProfileSchema);