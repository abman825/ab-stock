const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},
  phone: { type: String, default: '-' },
  location: { type: String, default: '-' },
  email: { type: String, default: '' },
  note: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);