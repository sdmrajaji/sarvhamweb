const express = require('express');
const router = express.Router();
const Stat = require('../models/Stat');
const auth = require('../middleware/auth');

// GET /api/stats (Public)
router.get('/', async (req, res) => {
  try {
    let stat = await Stat.findOne();
    if (!stat) {
      stat = new Stat({
        mealsDonated: '5,000+',
        treesPlanted: '500+',
        bloodBridges: '400+',
        address: 'Coimbatore, Tamil Nadu, India',
        phone: '+91 6385842829',
        email: 'sarvhamhelp@gmail.com'
      });
      await stat.save();
    }
    res.json(stat);
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/stats (Admin protected)
router.put('/', auth, async (req, res) => {
  try {
    const { mealsDonated, treesPlanted, bloodBridges, address, phone, email } = req.body;
    
    let stat = await Stat.findOne();
    if (!stat) {
      stat = new Stat();
    }
    
    stat.mealsDonated = mealsDonated !== undefined ? mealsDonated : stat.mealsDonated;
    stat.treesPlanted = treesPlanted !== undefined ? treesPlanted : stat.treesPlanted;
    stat.bloodBridges = bloodBridges !== undefined ? bloodBridges : stat.bloodBridges;
    stat.address = address !== undefined ? address : stat.address;
    stat.phone = phone !== undefined ? phone : stat.phone;
    stat.email = email !== undefined ? email : stat.email;

    await stat.save();
    res.json({ message: 'Stats and contact info updated successfully', data: stat });
  } catch (err) {
    console.error('Error updating stats:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
