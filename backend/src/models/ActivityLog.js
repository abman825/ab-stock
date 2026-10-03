const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['ADD', 'CREATE', 'EDIT', 'UPDATE', 'DELETE', 'INFO'],
    required: true
  },
  productName: {
    type: String,
    default: '-'
  },
  details: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    enum: ['pharmacy', 'building_materials'],
    default: 'pharmacy'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);