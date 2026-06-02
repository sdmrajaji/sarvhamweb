const express = require('express');
const router = express.Router();
const BloodEnquiry = require('../models/BloodEnquiry');
const auth = require('../middleware/auth');

// POST /api/blood-enquiry (Public)
router.post('/', async (req, res) => {
  try {
    const {
      patientName,
      contactName,
      email,
      phone,
      bloodGroup,
      unitsRequired,
      requiredDate,
      hospitalName,
      hospitalLocation,
      message
    } = req.body;

    // Validation
    if (!patientName || !contactName || !email || !phone || !bloodGroup || 
        !unitsRequired || !requiredDate || !hospitalName || !hospitalLocation) {
      return res.status(400).json({ error: 'All fields except message are required' });
    }

    const bloodEnquiry = new BloodEnquiry({
      patientName,
      contactName,
      email,
      phone,
      bloodGroup,
      unitsRequired,
      requiredDate,
      hospitalName,
      hospitalLocation,
      message
    });

    const savedBloodEnquiry = await bloodEnquiry.save();
    console.log('Saved blood enquiry:', savedBloodEnquiry);

    res.status(201).json({ message: 'Blood enquiry request submitted successfully' });
  } catch (err) {
    console.error('Error saving blood enquiry:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// GET /api/blood-enquiry (Admin protected)
router.get('/', auth, async (req, res) => {
  try {
    const enquiries = await BloodEnquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('Error fetching blood enquiries:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/blood-enquiry/:id (Admin protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const enquiry = await BloodEnquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ error: 'Blood enquiry not found' });
    }
    res.json({ message: 'Blood enquiry deleted successfully' });
  } catch (err) {
    console.error('Error deleting blood enquiry:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/blood-enquiry/:id (Admin protected - Edit / Status update)
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      patientName,
      contactName,
      email,
      phone,
      bloodGroup,
      unitsRequired,
      requiredDate,
      hospitalName,
      hospitalLocation,
      message,
      status
    } = req.body;

    const updatedEnquiry = await BloodEnquiry.findByIdAndUpdate(
      req.params.id,
      {
        patientName,
        contactName,
        email,
        phone,
        bloodGroup,
        unitsRequired,
        requiredDate,
        hospitalName,
        hospitalLocation,
        message,
        status
      },
      { new: true, runValidators: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ error: 'Blood enquiry not found' });
    }

    res.json({ message: 'Blood enquiry updated successfully', data: updatedEnquiry });
  } catch (err) {
    console.error('Error updating blood enquiry:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
