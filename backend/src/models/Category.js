const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    // unique: true የሚለውን አስወግደነዋል duplicate error እንዳያመጣ
    default: () => Math.floor(100000 + Math.random() * 900000).toString()
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
    enum: ['pharmacy', 'building', 'building_materials', 'buildingMaterials'],
    default: 'pharmacy'
  },
  productsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);