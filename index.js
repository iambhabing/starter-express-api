const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const randomstring = require('randomstring');

const app = express();
const port = 3000;

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: randomstring.generate(10),
  resave: false,
  saveUninitialized: true,
}));

// In-memory database
const users = {};

// Registration Logic
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if username already exists
  if (users[username]) {
    return res.status(400).send('Username already exists');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to the database
  users[username] = {
    username,
    password: hashedPassword
  };

  res.send('User registered successfully');
});

// Login Logic
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  const user = users[username];
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).send('Incorrect password');
  }

  // Authentication successful
  req.session.userId = username; // Store username in session
  res.send('Login successful');
});

// Logout Logic
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logout successful');
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

// Example protected route
app.get('/profile', requireAuth, (req, res) => {
  res.send(`Welcome to your profile, ${req.session.userId}`);
});

// Start server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
