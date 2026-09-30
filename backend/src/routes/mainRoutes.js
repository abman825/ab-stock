const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Controller & Middleware Imports
const controller = require('../controllers/mainController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
// ==========================================
// 1. Unprotected / Public Routes
// ==========================================

// Authentication Routes
router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/auth/forgot-password', controller.forgotPassword);
router.post('/auth/reset-password', controller.resetPassword);
router.post('/reset-password/:token', controller.resetPassword);

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);

// ==========================================
// 2. Protected Routes (JWT Token required)
// ==========================================
router.use(authMiddleware);

// Bulk Import Routes (áŠ¨á‰€áˆ¨á‰¡ á‰¥á‰» áŠ¥áŠ•á‹²áˆ°áˆ©)
if (controller.createProductsBulk) {
  router.post('/products/bulk', controller.createProductsBulk);
}
if (controller.createCategoriesBulk) {
  router.post('/categories/bulk', controller.createCategoriesBulk);
}

// Profile & Account Settings
router.get('/profile', controller.getProfile);
router.get('/auth/profile', controller.getProfile);

// Profile áˆ›áˆµá‰°áŠ«áŠ¨á‹«
const handleUpdateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, username } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (username) user.username = username;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json({ message: 'Profile update successful!', user: updatedUser });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Failed to update profile!' });
  }
};

router.put('/auth/update-profile', handleUpdateProfile);
router.put('/update-profile', handleUpdateProfile);

// Password áˆ˜á‰€á‹¨áˆªá‹«
router.put('/auth/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password!' });
    }

    user.password = newPassword; 
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ message: 'Failed to change password!' });
  }
});

// Reports & Analytics
if (controller.getAnalytics) {
  router.get('/reports/analytics', controller.getAnalytics);
}

// Products
router.get('/products', controller.getProducts);
router.post('/products', controller.createProduct);
if (controller.updateProduct) router.put('/products/:id', controller.updateProduct);
if (controller.deleteProduct) router.delete('/products/:id', controller.deleteProduct);

// Categories
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);
if (controller.updateCategory) router.put('/categories/:id', controller.updateCategory);
if (controller.deleteCategory) router.delete('/categories/:id', controller.deleteCategory);

// Suppliers
router.get('/suppliers', controller.getSuppliers);
router.post('/suppliers', controller.createSupplier);
if (controller.updateSupplier) router.put('/suppliers/:id', controller.updateSupplier);     
if (controller.deleteSupplier) router.delete('/suppliers/:id', controller.deleteSupplier);

// Purchase Orders
router.get('/purchase-orders', controller.getPurchases);
router.post('/purchase-orders', controller.createPurchase);

// Bulk Import CSV Route (Purchase Orders)
router.post('/purchase-orders/bulk', async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrders');
    const Product = require('../models/Product');

    const ordersData = req.body.map((item) => ({
      ...item,
      user: req.user.id,
      totalCost: item.totalCost || item.quantity * item.unitCost
    }));

    const savedOrders = await PurchaseOrder.insertMany(ordersData);

    for (const item of req.body) {
      if (item.productId) {
        await Product.findOneAndUpdate(
          { _id: item.productId, user: req.user.id },
          { $inc: { quantity: item.quantity, stock: item.quantity } }
        );
      }
    }

    res.status(201).json(savedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfers
router.get('/transfers', controller.getTransfers);
router.post('/transfers', controller.createTransfer);

// Orders & Sales
router.get('/orders/today-summary', controller.getTodaySalesSummary);
router.get('/orders', controller.getOrders);
router.post('/orders', controller.createOrder);

// Customers
router.get('/customers', controller.getCustomers);
router.post('/customers', controller.createCustomer);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});

module.exports = router;