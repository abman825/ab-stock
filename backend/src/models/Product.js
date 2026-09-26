const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // የመዘገበውን ተጠቃሚ ለመለየት (Multi-User Support)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  category: { type: String, required: true, default: 'General' },
  productType: { type: String, enum: ['Stock', 'Service'], default: 'Stock' },
  boughtPrice: { type: Number, default: 0 },
  price: { type: Number, required: true },
  stockThreshold: { type: Number, default: 0 },
  specificType: { type: String, default: '' },
  isSyrup: { type: Boolean, default: false },
  inStoreQty: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 0 },
  invoiceNo: { type: String },
  expiryDate: { type: Date },
  batchNumber: { type: String },
  supplier: { type: String, default: 'General Supplier' },
  location: { type: String, enum: ['stock', 'pharmacy'], default: 'pharmacy' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);