const express = require('express');
const router = express.Router();
const Join = require('../models/Join');
const auth = require('../middleware/auth');

// POST /api/join (Public)
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      fatherName,
      email,
      phone,
      whatsapp,
      aadhar,
      dob,
      gender,
      bloodGroup,
      street,
      place,
      district,
      pincode,
      state,
      message
    } = req.body;

    // Validation
    if (!fullName || !fatherName || !email || !phone || !whatsapp || !aadhar || !dob || !gender ||
        !bloodGroup || !street || !place || !district || !pincode || !state || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const newJoin = new Join({
      fullName,
      fatherName,
      email,
      phone,
      whatsapp,
      aadhar,
      dob,
      gender,
      bloodGroup,
      street,
      place,
      district,
      pincode,
      state,
      message
    });

    await newJoin.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Error saving join application:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/join (Admin protected)
router.get('/', auth, async (req, res) => {
  try {
    const applications = await Join.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/join/:id (Admin protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Join.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
