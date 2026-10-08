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

// 3. GET POS PRODUCTS
exports.getPOSProducts = async (req, res) => {
  try {
    const { businessType } = req.query;
    
    let filter = {
      user: req.user.id,
      $or: [
        { inStoreQty: { $gt: 0 } },         { quantity: {$gt: 0 } }
      ]
    };

    if (businessType) {
      filter.businessType = normalizeBusinessType(businessType);
    }

    const products = await Product.find(filter).sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findOne({ _id: req.params.id, user: req.user.id });
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });

    let updateData = { ...req.body };
    if (updateData.businessType) {
      updateData.businessType = normalizeBusinessType(updateData.businessType);
    }

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    // 👉 1. ምን ምን እንደተቀየረ ለይቶ ማወቂያ Logic
    let changes = [];

    // የስም ቅያሬ
    if (req.body.name && req.body.name !== oldProduct.name) {
      changes.push(`ስም ከ '${oldProduct.name}' ወደ '${updated.name}'`);
    }

    // የሽያጭ ዋጋ ቅያሬ (Price)
    const oldPrice = Number(oldProduct.price || 0);
    const newPrice = Number(updated.price || 0);
    if (req.body.price !== undefined && oldPrice !== newPrice) {
      changes.push(`የመሸጫ ዋጋ ከ ${oldPrice} ብር ወደ ${newPrice} ብር`);
    }

    // የግዢ ዋጋ ቅያሬ (Cost/Bought Price)
    const oldCost = Number(oldProduct.costPrice || oldProduct.boughtPrice || 0);
    const newCost = Number(updated.costPrice || updated.boughtPrice || 0);
    if ((req.body.costPrice !== undefined || req.body.boughtPrice !== undefined) && oldCost !== newCost) {
      changes.push(`የግዢ ዋጋ ከ ${oldCost} ብር ወደ ${newCost} ብር`);
    }

    // የብዛት/ስቶክ ቅያሬ (Quantity/Stock)
    const oldQty = Number(oldProduct.quantity ?? oldProduct.inShop ?? oldProduct.stock ?? 0);
    const newQty = Number(updated.quantity ?? updated.inShop ?? updated.stock ?? 0);
    if ((req.body.quantity !== undefined || req.body.inShop !== undefined) && oldQty !== newQty) {
      changes.push(`ብዛት ከ ${oldQty} ወደ ${newQty}`);
    }

    // የሱቅ/መጋዘን ብዛት ቅያሬ (InStore)
    const oldStore = Number(oldProduct.inStore || 0);
    const newStore = Number(updated.inStore || 0);
    if (req.body.inStore !== undefined && oldStore !== newStore) {
      changes.push(`በመጋዘን ያለ ብዛት ከ ${oldStore} ወደ ${newStore}`);
    }

    // 2. በዝርዝር የቪው ጽሁፉን ማዘጋጀት
    let detailMessage = '';
    if (changes.length > 0) {
      detailMessage = `${updated.name}፦ ${changes.join('፣ ')} ተቀይሯል`;
    } else {
      detailMessage = `የ ${updated.name} መረጃ ተሻሽሏል`;
    }

    // 3. Activity Log መመዝገብ
    await ActivityLog.create({
      action: 'EDIT',
      productName: updated.name,
      details: detailMessage,
      userId: req.user.id,
      employeeName: req.user.username || req.user.fullName || 'User'
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 5. DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await ActivityLog.create({
      action: 'DELETE',
      productName: product.name,
      details: `Deleted product ${product.name}`,
      userId: req.user.id,
      employeeName: req.user.username || req.user.fullName || 'User'
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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