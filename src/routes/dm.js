const express = require('express');
const Message = require('../../models/Message');
const User = require('../../models/User');

const router = express.Router();

// Route to send a direct message
router.post('/api/dm', async (req, res) => {
    try {
        const { username, message } = req.body;

        // Find the recipient user
        const recipient = await User.findOne({ username });
        if (!recipient) {
            return res.status(404).send('Recipient not found.');
        }

        // Save the message to the database
        const newMessage = new Message({
            sender: req.user.id, // Replace with actual sender ID retrieval logic
            recipient: recipient._id,
            content: message
        });
        await newMessage.save();

        res.status(200).send('Message sent successfully!');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Failed to send message.');
    }
});

module.exports = router;
