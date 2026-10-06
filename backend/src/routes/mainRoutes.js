const express = require('express');
const router = express.Router();

// AyrÄ±-ayrÄ± Controller-lÉ™rin Ã§aÄŸÄ±rÄ±lmasÄ±
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const purchaseController = require('../controllers/purchaseController');
const transferController = require('../controllers/transferController');
const orderController = require('../controllers/orderController');
const customerController = require('../controllers/customerController');
const analyticsController = require('../controllers/analyticsController');



// Middleware
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// 1. Unprotected / Public Routes
// ==========================================

// Authentication Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Shortcut Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// ==========================================
// 2. Protected Routes (JWT Token required)
// ==========================================
router.use(authMiddleware);

// Activity Logs Route
router.get('/activity-logs', productController.getActivityLogs);

// Bulk Import Routes
if (productController.createProductsBulk) {
  router.post('/products/bulk', productController.createProductsBulk);
}
if (categoryController.createCategoriesBulk) {
  router.post('/categories/bulk', categoryController.createCategoriesBulk);
}

// Profile & Account Settings
router.get('/profile', authController.getProfile);
router.get('/auth/profile', authController.getProfile);
router.put('/auth/update-profile', authController.updateProfile);
router.put('/update-profile', authController.updateProfile);
router.put('/auth/change-password', authController.changePassword);
router.put('/change-password', authController.changePassword);

// Reports & Analytics
router.get('/reports/analytics', analyticsController.getAnalytics);

// GET Daily Sales & Profit History (ንግድ ከተጀመረበት ቀን ጀምሮ በየቀኑ አድርጎ የሚያወጣ)
// mainRoutes.js ወይም routes/ ይዘት ውስጥ መጨመር ያለበት፡

const Order = require('../models/Order'); // የእንቅስቃሴ መዝገብህ Order.js ስለሆነ

// GET Daily Sales & Profit History
// GET Daily Sales & Profit History
router.get('/reports/daily-history', async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (businessType) {
      filter.businessType = businessType;
    }

    const dailyHistory = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          date: { $first: "$createdAt" },
          totalSales: { 
            $sum: { 
              $ifNull: ["$grandTotal", { $ifNull: ["$totalAmount", { $ifNull: ["$totalPrice", "$price"] }] }] 
            } 
          },
          totalProfit: { 
            $sum: { 
              $ifNull: ["$netProfit", { $ifNull: ["$totalProfit", "$profit"] }] 
            } 
          }
        }
      },
      { $sort: { date: -1 } }
    ]);

    // ዳታው ባዶ ከሆነ ያለ ፊልተር ሁሉንም ለማምጣት ይሞክራል
    if (dailyHistory.length === 0) {
      const fallbackHistory = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" }
            },
            date: { $first: "$createdAt" },
            totalSales: { 
              $sum: { 
                $ifNull: ["$grandTotal", { $ifNull: ["$totalAmount", { $ifNull: ["$totalPrice", "$price"] }] }] 
              } 
            },
            totalProfit: { 
              $sum: { 
                $ifNull: ["$netProfit", { $ifNull: ["$totalProfit", "$profit"] }] 
              } 
            }
          }
        },
        { $sort: { date: -1 } }
      ]);
      return res.json(fallbackHistory);
    }

    res.json(dailyHistory);
  } catch (error) {
    console.error("Daily history fetch error:", error);
    res.status(500).json({ message: "መረጃውን ማምጣት አልተቻለም" });
  }
});
// Products
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Categories
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Suppliers
router.get('/suppliers', supplierController.getSuppliers);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// Purchase Orders
router.get('/purchase-orders', purchaseController.getPurchases);
router.post('/purchase-orders', purchaseController.createPurchase);

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
router.get('/transfers', transferController.getTransfers);
router.post('/transfers', transferController.createTransfer);

// Orders & Sales
router.get('/orders/today-summary', orderController.getTodaySalesSummary);
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);

// Customers
router.get('/customers', customerController.getCustomers);
router.post('/customers', customerController.createCustomer);

module.exports = router;