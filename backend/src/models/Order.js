const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      name: String,
      price: Number,        // نرخى فروش
      costPrice: Number,    // نرخى كڕين (Snapshot)
      boughtPrice: Number,  // بۆ پشتگیری هەر دوو ناوەکە
      cartQty: Number
    }
  ],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank', 'Telebirr', 'cash', 'bank', 'telebirr'],
    default: 'Cash'
  },
  businessType: { 
    type: String, 
    enum: ['pharmacy', 'building', 'building_materials'], 
    default: 'pharmacy' 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  soldAtDate: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);