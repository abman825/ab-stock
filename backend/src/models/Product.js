const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, default: 'General' },
  productType: { type: String, enum: ['Stock', 'Service'], default: 'Stock' },
  
  // Business Type
  businessType: { 
    type: String, 
    enum: ['pharmacy', 'building', 'building_materials', 'buildingMaterials'], 
    default: 'pharmacy' 
  },
  boughtPrice: { type: Number, default: 0 },
  price: { type: Number, required: true, default: 0 },
  stockThreshold: { type: Number, default: 0 },
  specificType: { type: String, default: '' },
  unit: { type: String, default: '' },
  isSyrup: { type: Boolean, default: false },
  
  // Quantities
  inStoreQty: { type: Number, default: 0 },
  quantity: { type: Number, required: true, default: 0 }, // In-shop quantity
  
  // Tracking
  invoiceNo: { type: String, default: '' },
  expiryDate: { type: Date },
  batchNumber: { type: String, default: '' },
  supplier: { type: String, default: 'General Supplier' },
  location: { type: String, enum: ['stock', 'pharmacy'], default: 'pharmacy' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);