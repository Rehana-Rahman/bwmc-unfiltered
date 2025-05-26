const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDb } = require('./database');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const postRoutes = require('./routes/posts');
const friendRoutes = require('./routes/friends'); // Added

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Debugging middleware
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes); // Handles /login, /signup
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes); // Added

// Forum route
app.get('/forum', (req, res) => res.render('forum'));

// Connect to database and start server
const PORT = process.env.PORT || 3000;
connectDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});