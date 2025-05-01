const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Make sure this path is correct

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const contact = new Contact({ name, email, phone, message });
    
    const savedContact = await contact.save();
    console.log('Saved contact:', savedContact); // You will see this in your terminal

    res.status(201).json({ message: 'Contact saved successfully' });
  } catch (err) {
    console.error('Error saving contact:', err.message); // Also appears in terminal
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
