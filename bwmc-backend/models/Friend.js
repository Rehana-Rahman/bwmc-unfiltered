const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    user1: { type: String, required: true },
    user2: { type: String, required: true }
}, { 
    indexes: [
        [{ user1: 1, user2: 1 }, { unique: true }]
    ]
});

module.exports = mongoose.model('Friend', friendSchema);