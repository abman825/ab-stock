const express = require('express');
const router = express.Router();

// Controller & Middleware Imports
const controller = require('../controllers/mainController');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// 1. Unprotected / Public Routes
// ==========================================

// Authentication Routes
router.post('/auth/register', controller.register);
router.post('/auth/login', controller.login);
router.post('/auth/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);

// Shortcut Public Routes
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/forgot-password', controller.forgotPassword);

// ==========================================
// 2. Protected Routes (JWT Token required)
// ==========================================
router.use(authMiddleware);

// Bulk Import Routes
if (controller.createProductsBulk) {
  router.post('/products/bulk', controller.createProductsBulk);
}
if (controller.createCategoriesBulk) {
  router.post('/categories/bulk', controller.createCategoriesBulk);
}

// Profile & Account Settings
router.get('/profile', controller.getProfile);
router.get('/auth/profile', controller.getProfile);
router.put('/auth/update-profile', controller.updateProfile);
router.put('/update-profile', controller.updateProfile);
router.put('/auth/change-password', controller.changePassword);
router.put('/change-password', controller.changePassword);

// Reports & Analytics
router.get('/reports/analytics', controller.getAnalytics);

// Products
router.get('/products', controller.getProducts);
router.post('/products', controller.createProduct);
router.put('/products/:id', controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);

// Categories
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);

// Suppliers
router.get('/suppliers', controller.getSuppliers);
router.post('/suppliers', controller.createSupplier);

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

module.exports = router;