const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// POST /api/contact (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({ name, email, phone, message });
    const savedContact = await contact.save();
    console.log('Saved contact:', savedContact);

    res.status(201).json({ message: 'Contact saved successfully' });
  } catch (err) {
    console.error('Error saving contact:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contact (Admin protected)
router.get('/', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/contact/:id (Admin protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact query not found' });
    }
    res.json({ message: 'Contact query deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
