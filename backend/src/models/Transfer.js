const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},
  from: {
    type: String,
    required: true,
    enum: ['stock', 'store', 'shop']
  },
  to: {
    type: String,
    required: true,
    enum: ['stock', 'store', 'shop']
  },
   businessType: {
    type: String,
    enum: ['pharmacy', 'building_materials'],
    default: 'pharmacy'
  },
  transferredBy: {
    type: String,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      quantity: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Transfer', transferSchema);