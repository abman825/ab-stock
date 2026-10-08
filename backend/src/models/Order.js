const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productName: String,
      name: String,
      price: Number,
      costPrice: Number,
      boughtPrice: Number,
      cartQty: Number
    }
  ],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank', 'Telebirr', 'Credit', 'cash', 'bank', 'telebirr', 'credit'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Partial'],
    default: 'Paid'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: function() { return this.paymentMethod.toLowerCase() === 'credit'; }
  },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
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