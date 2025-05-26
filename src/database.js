const mongoose = require('mongoose');
require('dotenv').config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/forum_db');
    console.log('Connected to MongoDB (forum_db)');
  } catch (error) {
    console.error('MongoDB connection error:', error.message, error.stack);
    process.exit(1);
  }
};

module.exports = { connectDb };