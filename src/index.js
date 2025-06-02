const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const app = express();

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // In case you also send JSON via fetch
// Adjust for src/ folder

// Routes
app.get("/", (req, res) => {
  res.render('login');
});

app.get("/signup", (req, res) => {
  res.render('signup');
});

app.post("/signup", async (req, res) => {
  try {
    const data = {
      Username: req.body.Username,
      password: req.body.password,
    };

    if (!data.Username || !data.password) {
      return res.send('Please provide both Username and password.');
    }

    const existingUser = await collection.findOne({ Username: data.Username });
    if (existingUser) {
      return res.send('User already exists. Please choose a different username.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = new collection({
      Username: data.Username,
      password: hashedPassword,
    });

    await newUser.save();
    res.send('Signup successful! You can now login.');
  } catch (error) {
    if (error.code === 11000) {
      res.send('Username already taken. Please choose a different username.');
    } else {
      res.send('An error occurred during signup. Please try again.');
    }
  }
});

app.post('/login', async (req, res) => {
  try {
    const check = await collection.findOne({ Username: req.body.Username });
    if (!check) {
      return res.send('Username not found.');
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
    if (isPasswordMatch) {
      res.render('forum');
    } else {
      res.send('Wrong password');
    }
  } catch (error) {
    res.send('Incorrect details.');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`😎 Server running on Port: ${port}`);
});