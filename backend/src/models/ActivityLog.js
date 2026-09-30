const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String, // 'ADD', 'EDIT', 'DELETE'
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);