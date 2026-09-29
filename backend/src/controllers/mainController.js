const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrders');
const Transfer = require('../models/Transfer');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==================== 1. AUTHENTICATION & USER MANAGEMENT ====================

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አልተገኘም' });
    }

    // 1. Generate plain token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash di token for save na Database
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    // Set 30 mins time limit instead of 10 mins
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; 

    await user.save();

    // 3. Send di RAW token go frontend so EmailJS go put am inside di link
    res.json({ success: true, resetToken: rawToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. Hash di incoming raw token from URL to match DB hashedToken
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user with matching hashed token and active time
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'የሊንኩ ጊዜ አልፏል ወይም ትክክል አይደለም!' });
    }

    // 3. Hash new password and clear reset tokens
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'ፓስወርድዎ በተካሄደ ሁኔታ ተቀይሯል! አሁን መግባት ይችላሉ።' });
  } catch (err) {
    res.status(500).json({ message: 'ፓስወርድ መቀየር አልተቻለም', error: err.message });
  }
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username ወይም Email ቀደም ብሎ ተመዝግቧል!' });
    }

    const newUser = new User({
      username,
      email,
      password,
      fullName: fullName || '',
      phone: phone || ''
    });

    await newUser.save();

    res.status(201).json({ message: 'ተጠቃሚው በተሳካ ሁኔታ ተመዝግቧል!' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'ምዝገባው አልተሳካም!', error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const loginInput = username || email;

    if (!loginInput || !password) {
      return res.status(400).json({ message: 'እባክዎን ትክክለኛ መረጃ ያስገቡ!' });
    }

    const user = await User.findOne({
      $or: [
        { username: loginInput },
        { email: loginInput }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: 'የተሳሳተ Username/Email ወይም Password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'የተሳሳተ Username/Email ወይም Password!' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '7d'
    });

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'በተሳካ ሁኔታ ገብተዋል!',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'መግባት አልተቻለም!', error: err.message });
  }
};

// GET CURRENT PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'ተጠቃሚው አልተገኘም' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, email, username } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, email, username },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'ፕሮፋይልዎ በተሳካ ሁኔታ ተሻሽሏል', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "የነበረው ፓስወርድ ትክክለኛ አይደለም!" });
    }

    user.password = newPassword; 
    await user.save();

    res.json({ message: "ፓስወርድዎ በተሳካ ሁኔታ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== 2. PRODUCTS ====================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id }); 
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, user: req.user.id };
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FOR PRODUCTS BULK IMPORT
exports.createProductsBulk = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'አስፈላጊው የዳታ Array አልተላከም!' });
    }

    const formattedProducts = products.map((prod) => ({
      ...prod,
      user: req.user.id
    }));

    const savedProducts = await Product.insertMany(formattedProducts);
    res.status(201).json(savedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== 3. CATEGORIES ====================
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category({ ...req.body, user: req.user.id });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FOR CATEGORIES BULK IMPORT
exports.createCategoriesBulk = async (req, res) => {
  try {
    const categories = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'አስፈላጊው የዳታ Array አልተላከም!' });
    }

    const formattedCategories = categories.map((cat) => ({
      ...cat,
      user: req.user.id
    }));

    const savedCategories = await Category.insertMany(formattedCategories);
    res.status(201).json(savedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'ካቴጎሪው አልተገኘም ወይም ለማጥፋት ፈቃድ የሎትም' });
    }

    res.json({ message: 'ካቴጎሪው በተሳካ ሁኔታ ተሰርዟል' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE CATEGORY
exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'ካቴጎሪው አልተገኘም ወይም ለማስተካከል ፈቃድ የሎትም' });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==================== 4. SUPPLIERS ====================
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ user: req.user.id });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const newSupplier = new Supplier({ ...req.body, user: req.user.id });
    const saved = await newSupplier.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE SUPPLIER
exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deletedSupplier) {
      return res.status(404).json({ message: 'አቅራቢው አልተገኘም ወይም ለማጥፋት ፈቃድ የሎትም' });
    }

    res.json({ message: 'አቅራቢው በተሳካ ሁኔታ ተሰርዟል' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE SUPPLIER
exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: 'አቅራቢው አልተገኘም ወይም ለማስተካከል ፈቃድ የሎትም' });
    }

    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==================== 5. PURCHASE ORDERS ====================
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
    const calculatedTotalCost = qty * cost;

    const newPurchase = new PurchaseOrder({
      supplierName,
      productId,
      productName,
      quantity: qty,
      unitCost: cost,
      totalCost: calculatedTotalCost,
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

// ==================== 6. TRANSFERS ====================
exports.getTransfers = async (req, res) => {
  try {
    const transfers = await Transfer.find({ user: req.user.id });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const newTransfer = new Transfer({ ...req.body, user: req.user.id });
    const saved = await newTransfer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== 7. ORDERS (POS & SALES) ====================
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, discountAmount, grandTotal, paymentMethod, soldAtDate } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'ቢያንስ አንድ እቃ ማስገባት ያስፈልጋል' });
    }

    let totalCostPrice = 0;

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const productId = item.productId || item._id || item.id;
        let exactCost = item.costPrice || item.boughtPrice;

        if (exactCost === undefined || exactCost === null) {
          if (productId) {
            const product = await Product.findOne({ _id: productId, user: req.user.id });
            if (product) {
              exactCost = product.boughtPrice || product.costPrice || 0;
            }
          }
        }

        const unitPrice = Number(Number(item.price || 0).toFixed(2));
        const finalCost = Number(Number(exactCost || 0).toFixed(2));
        const quantity = Number(item.cartQty || item.quantity || 1);

        totalCostPrice += finalCost * quantity;

        return {
          productId: productId,
          productName: item.productName || item.name || '',
          name: item.productName || item.name || '',
          price: unitPrice,
          costPrice: finalCost,
          boughtPrice: finalCost,
          cartQty: quantity
        };
      })
    );

    const safeSubtotal = Number(Number(subtotal || 0).toFixed(2));
    const safeDiscount = Number(Number(discountAmount || 0).toFixed(2));
    const safeGrandTotal = Number(Number(grandTotal || (safeSubtotal - safeDiscount)).toFixed(2));

    const netProfit = Number((safeGrandTotal - totalCostPrice).toFixed(2));

    const order = new Order({
      user: req.user.id,
      items: processedItems,
      subtotal: safeSubtotal,
      discountAmount: safeDiscount,
      grandTotal: safeGrandTotal,
      totalCost: totalCostPrice,
      profit: netProfit,
      paymentMethod: paymentMethod || 'Cash',
      soldAtDate: soldAtDate || new Date().toISOString().split('T')[0]
    });

    const savedOrder = await order.save();

    const bulkStockOperations = items.map((item) => {
      const productId = item.productId || item._id || item.id;
      const qtyToDeduct = Number(item.cartQty || item.quantity || 1);

      return {
        updateOne: {
          filter: { _id: productId, user: req.user.id },
          update: { 
            $inc: { 
              quantity: -qtyToDeduct, 
              stock: -qtyToDeduct 
            } 
          }
        }
      };
    }).filter(op => op.updateOne.filter._id);

    if (bulkStockOperations.length > 0) {
      await Product.bulkWrite(bulkStockOperations);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(500).json({ error: err.message || 'ሽያጩን ማስመዝገብ አልተቻለም' });
  }
};

exports.getTodaySalesSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      user: req.user.id,
      $or: [
        { soldAtDate: todayStr },
        { createdAt: { $gte: startOfToday, $lte: endOfToday } }
      ]
    });

    let cash = 0, bank = 0, telebirr = 0;

    orders.forEach(order => {
      const amount = Number(order.grandTotal || order.subtotal || 0);
      const method = (order.paymentMethod || '').toLowerCase();

      if (method === 'cash') cash += amount;
      else if (method === 'bank') bank += amount;
      else if (method === 'telebirr') telebirr += amount;
    });

    res.json({
      cash,
      bank,
      telebirr,
      total: cash + bank + telebirr
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== 8. CUSTOMERS ====================
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user.id });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer({ ...req.body, user: req.user.id });
    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== 9. ANALYTICS (PROFIT CALCULATIONS) ====================
exports.getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let stats = {
      dailySales: 0,
      dailyProfit: 0,
      weeklySales: 0,
      weeklyProfit: 0,
      monthlySales: 0,
      monthlyProfit: 0,
      yearlySales: 0,
      yearlyProfit: 0,
      totalSales: 0,
      totalProfit: 0
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.soldAtDate);
      const grandTotal = Number(order.grandTotal || order.subtotal || 0);

      let orderProfit = 0;
      if (typeof order.profit === 'number') {
        orderProfit = order.profit;
      } else if (order.items && Array.isArray(order.items)) {
        orderProfit = order.items.reduce((acc, item) => {
          const sellPrice = Number(item.price || 0);
          const cost = Number(item.costPrice !== undefined ? item.costPrice : (item.boughtPrice || 0));
          const qty = Number(item.cartQty || item.quantity || 1);

          return acc + (sellPrice - cost) * qty;
        }, 0) - Number(order.discountAmount || 0);
      }

      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      const orderDateStr = order.soldAtDate || orderDate.toISOString().split('T')[0];
      if (orderDateStr === todayStr || orderDate >= startOfToday) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }

      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;
      }

      if (orderDate >= startOfMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;
      }

      if (orderDate >= startOfYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Server error in analytics' });
  }
};