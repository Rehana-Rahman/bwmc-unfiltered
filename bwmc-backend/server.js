require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected to bwmcDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// Routes
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/messages', require('./routes/messages'));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));