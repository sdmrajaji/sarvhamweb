const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');

router.post('/', async (req, res) => {
  try {
    console.log('Received data:', req.body);

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

    const newVolunteer = new Volunteer({
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

    await newVolunteer.save();

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error('Error saving volunteer:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
