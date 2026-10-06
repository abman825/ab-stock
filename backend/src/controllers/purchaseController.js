const PurchaseOrder = require('../models/PurchaseOrders');
const Product = require('../models/Product');

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await PurchaseOrder.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const { supplierName, productId, productName, quantity, unitCost, invoiceNumber } = req.body;
    const qty = Number(quantity) || 1;
    const cost = Number(unitCost) || 0;

    const newPurchase = new PurchaseOrder({
      supplierName,
      productId,
      productName,
      quantity: qty,
      unitCost: cost,
      totalCost: qty * cost,
      invoiceNumber,
      user: req.user.id
    });

    const saved = await newPurchase.save();

    if (productId) {
      await Product.findOneAndUpdate(
        { _id: productId, user: req.user.id },
        { $inc: { quantity: qty, stock: qty } }
      );
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};