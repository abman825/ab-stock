const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    default: () => Math.floor(1000 + Math.random() * 9000).toString() // 4-digit ID
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    enum: ['pharmacy', 'building_materials'],
    default: 'pharmacy'
  },
  productsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);