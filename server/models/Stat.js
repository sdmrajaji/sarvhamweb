const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  mealsDonated: {
    type: String,
    default: '5,000+'
  },
  treesPlanted: {
    type: String,
    default: '500+'
  },
  bloodBridges: {
    type: String,
    default: '400+'
  },
  address: {
    type: String,
    default: 'Coimbatore, Tamil Nadu, India'
  },
  phone: {
    type: String,
    default: '+91 6385842829'
  },
  email: {
    type: String,
    default: 'sarvhamhelp@gmail.com'
  }
});

module.exports = mongoose.model('Stat', statSchema);
