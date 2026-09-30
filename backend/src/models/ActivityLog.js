const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String, // 'EDIT', 'DELETE', 'CREATE'
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  details: {
    type: String, // ለምሳሌ: "Quantity changed from 10 to 5"
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);