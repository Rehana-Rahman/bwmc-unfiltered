const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Middleware to extract user ID from token
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('Unauthorized: No token provided');
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace 'your_jwt_secret' with your actual secret
        req.user = { id: decoded.id }; // Assuming the token contains the user ID
        next();
    } catch (error) {
        console.error('Invalid token:', error);
        res.status(401).send('Unauthorized: Invalid token');
    }
};

// Route to update user settings
router.post('/api/settings', authenticateUser, upload.single('profilePic'), async (req, res) => {
    try {
        const { profileName } = req.body;
        const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

        // Update user in the database
        const userId = req.user.id;
        await User.findByIdAndUpdate(userId, { name: profileName, profilePic });

        res.status(200).send('Settings updated successfully!');
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).send('Failed to update settings.');
    }
});

module.exports = router;
