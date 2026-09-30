const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrders');
const Transfer = require('../models/Transfer');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Helper function ለ User ስም አወጣጥ
const getUserName = (req) => {
  if (req.user) {
    return req.user.username || req.user.fullName || req.user.email || 'Unknown User';
  }
  return 'System User';
};

// ==========================================
// 1. PRODUCTS CONTROLLER
// ==========================================

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      user: req.user.id
    });
    await newProduct.save();

    // 📝 Activity Log መመዝገቢያ
    try {
      await ActivityLog.create({
        user: getUserName(req),
        action: 'ADD',
        productName: newProduct.name,
        details: `Added product: ${newProduct.name} (Price: ${newProduct.salePrice || newProduct.price || 0} Birr)`
      });
    } catch (logErr) {
      console.error('Failed to save activity log:', logErr);
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 📝 Activity Log መመዝገቢያ
    try {
      await ActivityLog.create({
        user: getUserName(req),
        action: 'EDIT',
        productName: updatedProduct.name,
        details: `Updated product details/stock for ${updatedProduct.name}`
      });
    } catch (logErr) {
      console.error('Failed to save activity log:', logErr);
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 📝 Activity Log መመዝገቢያ
    try {
      await ActivityLog.create({
        user: getUserName(req),
        action: 'DELETE',
        productName: product.name,
        details: `Deleted product: ${product.name} from inventory`
      });
    } catch (logErr) {
      console.error('Failed to save activity log:', logErr);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

exports.createProductsBulk = async (req, res) => {
  try {
    const productsData = req.body.map(item => ({ ...item, user: req.user.id }));
    const inserted = await Product.insertMany(productsData);

    try {
      await ActivityLog.create({
        user: getUserName(req),
        action: 'ADD',
        productName: `${inserted.length} Products`,
        details: `Bulk imported ${inserted.length} products`
      });
    } catch (logErr) {
      console.error('Failed to save activity log:', logErr);
    }

    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: 'Error importing products', error: err.message });
  }
};

// ==========================================
// 2. CATEGORIES CONTROLLER
// ==========================================

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories', error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category({ ...req.body, user: req.user.id });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error updating category', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category', error: err.message });
  }
};

exports.createCategoriesBulk = async (req, res) => {
  try {
    const categoriesData = req.body.map(item => ({ ...item, user: req.user.id }));
    const inserted = await Category.insertMany(categoriesData);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: 'Error importing categories', error: err.message });
  }
};

// ==========================================
// 3. SUPPLIERS CONTROLLER
// ==========================================

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.user.id });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching suppliers', error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier({ ...req.body, user: req.user.id });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Error creating supplier', error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Error updating supplier', error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting supplier', error: err.message });
  }
};

// ==========================================
// 4. PURCHASES, TRANSFERS & ORDERS
// ==========================================

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await PurchaseOrder.find({ user: req.user.id });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching purchases', error: err.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const purchase = new PurchaseOrder({ ...req.body, user: req.user.id });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ message: 'Error creating purchase', error: err.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({ user: req.user.id });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transfers', error: err.message });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const transfer = new Transfer({ ...req.body, user: req.user.id });
    await transfer.save();
    res.status(201).json(transfer);
  } catch (err) {
    res.status(500).json({ message: 'Error creating transfer', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const order = new Order({ ...req.body, user: req.user.id });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

exports.getTodaySalesSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      user: req.user.id,
      createdAt: { $gte: startOfDay }
    });

    const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    res.json({ count: orders.length, totalSales });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sales summary', error: err.message });
  }
};

// ==========================================
// 5. CUSTOMERS & PROFILE
// ==========================================

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer({ ...req.body, user: req.user.id });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ user: req.user.id });
    const orderCount = await Order.countDocuments({ user: req.user.id });
    res.json({ productCount, orderCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};

// Auth Placeholder Handlers
exports.register = (req, res) => res.status(500).json({ message: 'Auth routes handled separately' });
exports.login = (req, res) => res.status(500).json({ message: 'Auth routes handled separately' });
exports.forgotPassword = (req, res) => res.status(500).json({ message: 'Auth routes handled separately' });
exports.resetPassword = (req, res) => res.status(500).json({ message: 'Auth routes handled separately' });