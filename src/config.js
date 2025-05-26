const mongoose = require('mongoose');

// Connect to MongoDB
const connect = mongoose.connect("mongodb://localhost:27017/login-tut");
connect.then(() => {
    console.log('Database connected successfully');
  })
  .catch(() => {
    console.error('Database connection failed:', error);
  });

// Define User schema
const LoginSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create and export the model
const collection = mongoose.model('users', LoginSchema);

module.exports = collection;