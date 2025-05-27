const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  bio: String,
  friends: [{ type: String }]
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;