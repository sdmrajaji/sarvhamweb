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
  }
});

module.exports = mongoose.model('Stat', statSchema);
