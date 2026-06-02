const express = require('express');
const router = express.Router();
const Stat = require('../models/Stat');
const auth = require('../middleware/auth');

// GET /api/stats (Public)
router.get('/', async (req, res) => {
  try {
    let stat = await Stat.findOne();
    if (!stat) {
      stat = new Stat({ mealsDonated: '5,000+', treesPlanted: '500+', bloodBridges: '400+' });
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
    const { mealsDonated, treesPlanted, bloodBridges } = req.body;
    
    let stat = await Stat.findOne();
    if (!stat) {
      stat = new Stat();
    }
    
    stat.mealsDonated = mealsDonated || stat.mealsDonated;
    stat.treesPlanted = treesPlanted || stat.treesPlanted;
    stat.bloodBridges = bloodBridges || stat.bloodBridges;

    await stat.save();
    res.json({ message: 'Stats updated successfully', data: stat });
  } catch (err) {
    console.error('Error updating stats:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

module.exports = router;
