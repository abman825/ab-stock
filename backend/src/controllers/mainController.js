const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const PurchaseOrders = require('../models/PurchaseOrders');
const Transfer = require('../models/Transfer');
const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. AUTHENTICATION CONTROLLERS
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, username, phone } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      username,
      phone,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const userData = user.toObject();
    delete userData.password;

    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  res.json({ message: 'Password reset feature endpoint' });
};

exports.resetPassword = async (req, res) => {
  res.json({ message: 'Password reset successful' });
};

// 2. PROFILE CONTROLLERS
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. ACTIVITY LOGS
exports.getActivityLogs = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const logs = await ActivityLog.find({ user: userId }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. BULK IMPORTS
exports.createProductsBulk = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const productsData = req.body.map(item => ({ ...item, user: userId }));
    const savedProducts = await Product.insertMany(productsData);
    res.status(201).json(savedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategoriesBulk = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const categoriesData = req.body.map(item => ({ ...item, user: userId }));
    const savedCategories = await Category.insertMany(categoriesData);
    res.status(201).json(savedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. REPORTS & ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const totalProducts = await Product.countDocuments({ user: userId });
    const totalOrders = await Order.countDocuments({ user: userId });
    res.json({ totalProducts, totalOrders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const products = await Product.find({ user: userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newProduct = new Product({ ...req.body, user: userId });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Product.findOneAndDelete({ _id: req.params.id, user: userId });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. CATEGORIES
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const categories = await Category.find({ user: userId }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newCategory = new Category({ ...req.body, user: userId });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Category.findOneAndDelete({ _id: req.params.id, user: userId });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. SUPPLIERS
exports.getSuppliers = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const suppliers = await Supplier.find({ user: userId }).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newSupplier = new Supplier({ ...req.body, user: userId });
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const updated = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Supplier.findOneAndDelete({ _id: req.params.id, user: userId });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. PURCHASE ORDERS
exports.getPurchases = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const purchases = await PurchaseOrders.find({ user: userId }).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPurchase = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newPurchase = new PurchaseOrders({ ...req.body, user: userId });
    const savedPurchase = await newPurchase.save();
    res.status(201).json(savedPurchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. TRANSFERS
exports.getTransfers = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const transfers = await Transfer.find({ user: userId }).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newTransfer = new Transfer({ ...req.body, user: userId });
    const savedTransfer = await newTransfer.save();
    res.status(201).json(savedTransfer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 11. ORDERS & SALES
exports.getTodaySalesSummary = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      user: userId,
      createdAt: { $gte: startOfDay }
    });

    const totalSales = orders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
    res.json({ count: orders.length, totalSales });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newOrder = new Order({ ...req.body, user: userId });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 12. CUSTOMERS
exports.getCustomers = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const customers = await Customer.find({ user: userId }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newCustomer = new Customer({ ...req.body, user: userId });
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};