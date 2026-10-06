const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');

// Helper function businessType normalize gochuuf
const normalizeBusinessType = (type) => {
  if (!type) return 'pharmacy';
  const lower = type.toLowerCase();
  if (lower === 'building' || lower === 'building_materials' || lower === 'buildingmaterials') {
    return 'building_materials';
  }
  return 'pharmacy';
};

// 1. CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const businessType = normalizeBusinessType(req.body.businessType);

    const newProduct = new Product({
      ...req.body,
      user: req.user.id,
      businessType: businessType,
      invoiceNo: req.body.invoiceNo || `INV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });

    const savedProduct = await newProduct.save();

    // Activity Log Uumuu
    await ActivityLog.create({
      action: 'ADD',
      productName: savedProduct.name,
      details: `Product ${savedProduct.name} created`,
      userId: req.user.id,
      employeeName: req.user.username || req.user.fullName || 'User'
    });

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const { businessType } = req.query;
    let query = { user: req.user.id };

    if (businessType) {
      query.businessType = normalizeBusinessType(businessType);
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. CREATE PRODUCTS BULK
exports.createProductsBulk = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Data array is required!' });
    }

    const formattedProducts = products.map((prod) => ({
      ...prod,
      user: req.user.id,
      businessType: normalizeBusinessType(prod.businessType)
    }));

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

// 7. GET ACTIVITY LOGS
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user.id }).sort({ createdAt: -1, timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};