const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const auth = require('../middleware/auth');

// POST /api/donor (Public - Register as Donor)
router.post('/', async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      bloodGroup,
      age,
      gender,
      city,
      address,
      lastDonationDate,
      availability,
      consent
    } = req.body;

    // Validation
    if (!fullName || !phone || !bloodGroup || !age || !gender || !city || !address) {
      return res.status(400).json({ error: 'All fields except email, last donation date, and availability are required' });
    }

    if (!consent) {
      return res.status(400).json({ error: 'Consent is required to register as a donor' });
    }

    // Check for duplicate donor by phone
    const existingDonor = await Donor.findOne({ phone });
    if (existingDonor) {
      return res.status(400).json({ error: 'A donor with this mobile number is already registered' });
    }

    const donor = new Donor({
      fullName,
      phone,
      email: email || undefined,
      bloodGroup,
      age,
      gender,
      city,
      address,
      lastDonationDate: lastDonationDate || null,
      availability: availability || 'available',
      consent: true
    });

    const savedDonor = await donor.save();
    console.log('Saved new blood donor:', savedDonor);

    res.status(201).json({ message: 'Registered successfully as a blood donor' });
  } catch (err) {
    console.error('Error saving blood donor:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/donor (Admin protected - List all donors)
router.get('/', auth, async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    console.error('Error fetching donors:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/donor/:id (Admin protected - Edit Donor profile)
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      bloodGroup,
      age,
      gender,
      city,
      address,
      lastDonationDate,
      availability,
      consent
    } = req.body;

    const updatedDonor = await Donor.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        phone,
        email,
        bloodGroup,
        age,
        gender,
        city,
        address,
        lastDonationDate: lastDonationDate || null,
        availability,
        consent
      },
      { new: true, runValidators: true }
    );

    if (!updatedDonor) {
      return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({ message: 'Donor profile updated successfully', data: updatedDonor });
  } catch (err) {
    console.error('Error updating donor:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// DELETE /api/donor/:id (Admin protected - Remove donor registration)
router.delete('/:id', auth, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor registration not found' });
    }
    res.json({ message: 'Donor registration deleted successfully' });
  } catch (err) {
    console.error('Error deleting donor:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
