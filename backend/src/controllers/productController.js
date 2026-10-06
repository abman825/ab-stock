const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      user: req.user.id,
      invoiceNo: req.body.invoiceNo || `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { businessType } = req.query;
    let query = { user: req.user.id };

    if (businessType) {
      query.businessType = (businessType === 'building' || businessType === 'building_materials' || businessType === 'buildingMaterials')
        ? 'building_materials'
        : 'pharmacy';
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPOSProducts = async (req, res) => {
  try {
    const { businessType } = req.query;
    let filter = { user: req.user.id };
    
    if (businessType) {
      filter.businessType = (businessType === 'building' || businessType.includes('building')) ? 'building_materials' : 'pharmacy';
    }

    filter.$or = [{ inShop: { $gt: 0 } }, { quantity: {$gt: 0 } }];
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findOne({ _id: req.params.id, user: req.user.id });
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      action: 'EDIT',
      productName: updated.name,
      details: `Updated product ${updated.name}`,
      userId: req.user.id,
      employeeName: req.user.username || req.user.fullName || 'User'
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (product) {
      await ActivityLog.create({
        action: 'DELETE',
        productName: product.name,
        details: `Deleted product ${product.name}`,
        userId: req.user.id,
        employeeName: req.user.username || req.user.fullName || 'User'
      });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProductsBulk = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Data array is required!' });
    }

    const formattedProducts = products.map((prod) => ({ ...prod, user: req.user.id }));
    const savedProducts = await Product.insertMany(formattedProducts);

    await ActivityLog.create({
      action: 'ADD',
      productName: 'Bulk Import',
      details: `Imported ${savedProducts.length} products`,
      userId: req.user.id,
      employeeName: req.user.username || req.user.fullName || 'User'
    });

    res.status(201).json(savedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};