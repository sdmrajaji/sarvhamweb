const mongoose = require('mongoose');

const bloodEnquirySchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  bloodGroup: {
    type: String,
    required: true
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: [1, 'Must request at least 1 unit']
  },
  requiredDate: {
    type: Date,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalLocation: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('BloodEnquiry', bloodEnquirySchema);
