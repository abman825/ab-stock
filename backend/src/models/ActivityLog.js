const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false, // 👈 እዚች ጋር false አድርጋት (ወይም ከነጭራሹ 'user' የሚለውን ሰርዘው)
    default: 'System'
  },
  action: {
    type: String,
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