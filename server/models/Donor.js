const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: {
    type: String,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  bloodGroup: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: [18, 'Must be at least 18 years old'],
    max: [65, 'Must be 65 years old or younger']
  },
  gender: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  availability: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  consent: {
    type: Boolean,
    required: true,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
