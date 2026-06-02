const path = require('path');
// Load environment variables from parent folder .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static frontend assets from 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// Specific alias for `/admin` to serve `/admin.html`
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// Import Routes
const contactRoutes = require('./routes/contact');
const joinRoutes = require('./routes/join');
const galleryRoutes = require('./routes/gallery');
const authRoutes = require('./routes/auth');
const statsRoutes = require('./routes/stats');
const bloodEnquiryRoutes = require('./routes/bloodEnquiry');
const donorRoutes = require('./routes/donor');

// Use Routes
app.use('/api/contact', contactRoutes);
app.use('/api/join', joinRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/blood-enquiry', bloodEnquiryRoutes);
app.use('/api/donor', donorRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
