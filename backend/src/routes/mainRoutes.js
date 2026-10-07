const express = require('express');
const router = express.Router();

// Import Controllerů
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const purchaseController = require('../controllers/purchaseController');
const transferController = require('../controllers/transferController');
const orderController = require('../controllers/orderController');
const customerController = require('../controllers/customerController');
const analyticsController = require('../controllers/analyticsController');

// Import Middleware (dekonstrukce obou funkcí)
const { protect, checkSubscription } = require('../middleware/authMiddleware');

// ==========================================
// 1. Veřejné Cesty (Unprotected / Public Routes)
// ==========================================

// Autentizace
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Zkrácené veřejné cesty
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);

// ==========================================
// 2. Chráněné Cesty (Aplikuje se kontrola Tokenu i Předplatného)
// ==========================================
// Všechny cesty níže vyžadují platné přihlášení A aktivní předplatné
router.use(protect, checkSubscription);

// Protokoly aktivit (Activity Logs)
router.get('/activity-logs', productController.getActivityLogs);

// Hromadný import (Bulk Import)
if (productController.createProductsBulk) {
  router.post('/products/bulk', productController.createProductsBulk);
}
if (categoryController.createCategoriesBulk) {
  router.post('/categories/bulk', categoryController.createCategoriesBulk);
}

// Profil a Nastavení Účtu
router.get('/profile', authController.getProfile);
router.get('/auth/profile', authController.getProfile);
router.put('/auth/update-profile', authController.updateProfile);
router.put('/update-profile', authController.updateProfile);
router.put('/auth/change-password', authController.changePassword);
router.put('/change-password', authController.changePassword);
//router.put('/admin/renew-subscription', protect, authController.renewSubscription);

// Reporty a Analytika
router.get('/reports/analytics', analyticsController.getAnalytics);
router.get('/reports/daily-history', analyticsController.getDailyHistory);

// Produkty (Products)
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Kategorie (Categories)
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Dodavatelé (Suppliers)
router.get('/suppliers', supplierController.getSuppliers);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// Nákupní Objednávky (Purchase Orders)
router.get('/purchase-orders', purchaseController.getPurchases);
router.post('/purchase-orders', purchaseController.createPurchase);

// Hromadný import nákupních objednávek (Bulk Import CSV)
router.post('/purchase-orders/bulk', async (req, res) => {
  try {
    const PurchaseOrder = require('../models/PurchaseOrders');
    const Product = require('../models/Product');

    const ordersData = req.body.map((item) => ({
      ...item,
      user: req.user.id || req.user._id,
      totalCost: item.totalCost || item.quantity * item.unitCost
    }));

    const savedOrders = await PurchaseOrder.insertMany(ordersData);

    for (const item of req.body) {
      if (item.productId) {
        await Product.findOneAndUpdate(
          { _id: item.productId, user: req.user.id || req.user._id },
          { $inc: { quantity: item.quantity, stock: item.quantity } }
        );
      }
    }

    res.status(201).json(savedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Převody / Transfers
router.get('/transfers', transferController.getTransfers);
router.post('/transfers', transferController.createTransfer);

// Prodeje a Objednávky (Orders & Sales)
router.get('/orders/today-summary', orderController.getTodaySalesSummary);
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);

// Zákazníci (Customers)
router.get('/customers', customerController.getCustomers);
router.post('/customers', customerController.createCustomer);

module.exports = router;