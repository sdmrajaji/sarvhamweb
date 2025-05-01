require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db'); // Import the DB connection

const app = express(); // Initialize Express

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // JSON parsing middleware
app.use(bodyParser.json()); // For parsing application/json

// Routes
const contactRoutes = require('./routes/contact');
const volunteerRoutes = require('./routes/volunteer');

// Use Routes
app.use('/api/contact', contactRoutes);
app.use('/api/volunteer', volunteerRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
