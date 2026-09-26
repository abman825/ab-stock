const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
},
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  invoiceNumber: { type: String, default: () => 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase() },
  status: { type: String, default: 'Completed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);