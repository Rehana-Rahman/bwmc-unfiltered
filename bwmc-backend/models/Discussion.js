const mongoose = require('mongoose');

const DiscussionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  group: {
    type: String,
    default: 'General' // Optional: associate discussions with groups
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Discussion', DiscussionSchema);