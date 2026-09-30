const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrders');
const Transfer = require('../models/Transfer');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const ActivityLog = require('../models/ActivityLog');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// ==================== 1. USER & AUTHENTICATION ====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'áŠ¥á‰£áŠ­á‹ŽáŠ• áŠ¢áˆœá‹­áˆ á‹«áˆµáŒˆá‰¡' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'á‰ á‹šáˆ… áŠ¢áˆœá‹­áˆ á‹¨á‰°áˆ˜á‹˜áŒˆá‰  á‰°áŒ á‰ƒáˆš áŠ áˆá‰°áŒˆáŠ˜áˆ' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'https://ab-stock.vercel.app';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #0b5ed7; text-align: center;">á‹¨á‹­áˆˆá á‰ƒáˆ áˆ˜á‰€á‹¨áˆªá‹«</h2>
          <p>áˆ°áˆ‹áˆ ${user.fullName || ''}á¤</p>
          <p>á‹¨á‹­áˆˆá á‰ƒáˆá‹ŽáŠ• áˆˆáˆ˜á‰€á‹¨áˆ­ áŒ¥á‹«á‰„ áŠ á‰…áˆ­á‰ á‹‹áˆá¢ áŠ¥á‰£áŠ­á‹ŽáŠ• áŠ¨á‰³á‰½ á‹«áˆˆá‹áŠ• áˆŠáŠ•áŠ­ á‹­áŒ«áŠ‘á¤</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #0b5ed7; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              á‹¨á‹­áˆˆá á‰ƒáˆ á‰€á‹­áˆ­
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">á‹­áˆ… áˆŠáŠ•áŠ­ á‹¨áˆšá‹«áŒˆáˆˆáŒáˆˆá‹ áˆˆ <strong>10 á‹°á‰‚á‰ƒ</strong> á‰¥á‰» áŠá‹á¢</p>
        </div>
      `
    });

    res.json({ message: 'á‹¨á‹­áˆˆá á‰ƒáˆ áˆ˜á‰€á‹¨áˆªá‹« áˆŠáŠ•áŠ­ á‹ˆá‹° áŠ¢áˆœá‹­áˆá‹Ž á‰°áˆáŠ³áˆ' });
  } catch (err) {
    res.status(500).json({ message: 'áŠ¢áˆœá‹­áˆ áˆ˜áˆ‹áŠ­ áŠ áˆá‰°‰»áˆˆáˆ', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'Username á‹ˆá‹­áˆ Email á‰€á‹°áˆ á‰¥áˆŽ á‰°áˆ˜á‹áŒá‰§áˆ!' });

    const newUser = new User({ 
      username, 
      email, 
      password, 
      fullName: fullName || '', 
      phone: phone || '' 
    });

    await newUser.save();
    res.status(201).json({ message: 'á‰°áŒ á‰ƒáˆšá‹ á‰ á‰°áˆ³áŠ« áˆáŠ”á‰³ á‰°áˆ˜á‹áŒá‰§áˆ!' });
  } catch (err) {
    res.status(500).json({ message: 'áˆá‹áŒˆá‰£á‹ áŠ áˆá‰°áˆ³áŠ«áˆ!', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginInput = username || email;
    if (!loginInput || !password) return res.status(400).json({ message: 'áŠ¥á‰£áŠ­á‹ŽáŠ• á‰µáŠ­áŠ­áˆˆáŠ› áˆ˜áˆ¨áŒƒ á‹«áˆµáŒˆá‰¡!' });

    const user = await User.findOne({ $or: [{ username: loginInput }, { email: loginInput }] });
    if (!user) return res.status(400).json({ message: 'á‹¨á‰°áˆ³áˆ³á‰° Username/Email á‹ˆá‹­áˆ Password!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'á‹¨á‰°áˆ³áˆ³á‰° Username/Email á‹ˆá‹­áˆ Password!' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    const userData = user.toObject();
    delete userData.password;

    res.json({ message: 'á‰ á‰°áˆ³áŠ« áˆáŠ”á‰³ áŒˆá‰¥á‰°á‹‹áˆ!', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'áˆ˜áŒá‰£á‰µ áŠ áˆá‰°á‰»áˆˆáˆ!', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'á‰°áŒ á‰ƒáˆšá‹ áŠ áˆá‰°áŒˆáŠ˜áˆ' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, email, username } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, { fullName, phone, email, username }, { new: true, runValidators: true }).select('-password');
    res.json({ message: 'á•áˆ®á‹á‹­áˆá‹Ž á‰ á‰°áˆ³áŠ« áˆáŠ”á‰³ á‰°áˆ»áˆ½áˆáˆ', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "á‹¨áŠá‰ áˆ¨á‹ á“áˆµá‹ˆáˆ­á‹µ á‰µáŠ­áŠ­áˆˆáŠ› áŠ á‹­á‹°áˆˆáˆ!" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "á“áˆµá‹ˆáˆ­á‹µá‹Ž á‰ á‰°áˆ³áŠ« áˆáŠ”á‰³ á‰°á‰€á‹­áˆ¯áˆ!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'áˆŠáŠ•áŠ© áŒŠá‹œá‹ áŠ áˆááˆ á‹ˆá‹­áˆ á‰µáŠ­áŠ­áˆˆáŠ› áŠ á‹­á‹°áˆˆáˆ' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'á“áˆµá‹ˆáˆ­á‹µá‹Ž á‰ á‰°áˆ³áŠ« áˆáŠ”á‰³ á‰°á‰€á‹­áˆ¯áˆ! áŠ áˆáŠ• áˆ˜áŒá‰£á‰µ á‹­á‰½áˆ‹áˆ‰' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    try {
      await ActivityLog.create({
        action: 'ADD',
        productName: savedProduct.name,
        details: `Added product: Shop Qty (${savedProduct.quantity || 0}), Store Qty (${savedProduct.inStoreQty || 0})`,
        userId: req.user.id,
        user: req.user.id
      });
    } catch (logErr) {
      console.error('Activity Log save error:', logErr);
    }

    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const oldProduct = await Product.findOne({ _id: req.params.id, user: req.user.id });
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    const changes = [];
    const oldShopQty = oldProduct.quantity ?? 0;
    const newShopQty = updatedProduct.quantity ?? 0;
    if (oldShopQty !== newShopQty) changes.push(`Shop Qty: ${oldShopQty} âž” ${newShopQty}`);

    const oldStoreQty = oldProduct.inStoreQty ?? 0;
    const newStoreQty = updatedProduct.inStoreQty ?? 0;
    if (oldStoreQty !== newStoreQty) changes.push(`Store Qty: ${oldStoreQty} âž” ${newStoreQty}`);

    const oldPrice = oldProduct.salePrice || oldProduct.price || 0;
    const newPrice = updatedProduct.salePrice || updatedProduct.price || 0;
    if (oldPrice !== newPrice) changes.push(`Price: ${oldPrice} âž” ${newPrice} Birr`);

    const detailMsg = changes.length > 0 ? changes.join(' | ') : 'Updated basic product details';

    try {
      await ActivityLog.create({
        action: 'EDIT',
        productName: updatedProduct.name,
        details: detailMsg,
        userId: req.user.id,
        user: req.user.id
      });
    } catch (logErr) {
      console.error('Activity Log save error:', logErr);
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    try {
      await ActivityLog.create({
        action: 'DELETE',
        productName: product.name,
        details: `Deleted product. Final Shop Qty: (${product.quantity || 0}), Store Qty: (${product.inStoreQty || 0})`,
        userId: req.user.id,
        user: req.user.id
      });
    } catch (logErr) {
      console.error('Activity Log save error:', logErr);
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
      return res.status(400).json({ message: 'áŠ áˆµáˆáˆ‹áŒŠá‹ á‹¨á‹³á‰³ Array áŠ áˆá‰°áˆ‹áŠ¨áˆ!' });
    }

    const formattedProducts = products.map((prod) => ({
      ...prod,
      user: req.user.id
    }));

    const savedProducts = await Product.insertMany(formattedProducts);

    try {
      await ActivityLog.create({
        action: 'ADD',
        productName: `${savedProducts.length} Products`,
        details: `Bulk imported ${savedProducts.length} items`,
        userId: req.user.id,
        user: req.user.id
      });
    } catch (logErr) {
      console.error('Activity Log save error:', logErr);
    }

    res.status(201).json(savedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== 3. CATEGORIES (EDIT & DELETE INCLUDED) ====================
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

exports.updateCategory = async (req, res) => {
  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategoriesBulk = async (req, res) => {
  try {
    const categories = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'áŠ áˆµáˆáˆ‹áŒŠá‹ á‹¨á‹³á‰³ Array áŠ áˆá‰°áˆ‹áŠ¨áˆ!' });
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

// ==================== 4. SUPPLIERS (EDIT & DELETE INCLUDED) ====================
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

exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSupplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updatedSupplier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deletedSupplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      return res.status(400).json({ error: 'á‰¢á‹«áŠ•áˆµ áŠ áŠ•á‹µ áŠ¥á‰ƒ áˆ›áˆµáŒˆá‰£á‰µ á‹«áˆµáˆáˆáŒ‹áˆ' });
    }

    let totalCostPrice = 0;

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const productId = item.productId || item._id || item.id;
        let exactCost = item.costPrice || item.boughtPrice;

        if (exactCost === undefined || exactCost === null) {
          if (productId) {
            const product = await Product.findOne({ _id: productId, user: req.user.id });
            if (product) exactCost = product.boughtPrice || product.costPrice || 0;
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
          update: { $inc: { quantity: -qtyToDeduct, stock: -qtyToDeduct } }
        }
      };
    }).filter(op => op.updateOne.filter._id);

    if (bulkStockOperations.length > 0) {
      await Product.bulkWrite(bulkStockOperations);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message || 'áˆ½á‹«áŒ©áŠ• áˆ›áˆµáˆ˜á‹áŒˆá‰¥ áŠ áˆá‰°á‰»áˆˆáˆ' });
  }
};

exports.getTodaySalesSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      user: req.user.id,
      $or: [{ soldAtDate: todayStr }, { createdAt: { $gte: startOfToday,$lte: endOfToday } }]
    });

    let cash = 0, bank = 0, telebirr = 0;
    orders.forEach(order => {
      const amount = Number(order.grandTotal || order.subtotal || 0);
      const method = (order.paymentMethod || '').toLowerCase();
      if (method === 'cash') cash += amount;
      else if (method === 'bank') bank += amount;
      else if (method === 'telebirr') telebirr += amount;
    });

    res.json({ cash, bank, telebirr, total: cash + bank + telebirr });
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

// ==================== 9. ANALYTICS ====================
exports.getAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let stats = {
      dailySales: 0, dailyProfit: 0,
      weeklySales: 0, weeklyProfit: 0,
      monthlySales: 0, monthlyProfit: 0,
      yearlySales: 0, yearlyProfit: 0,
      totalSales: 0, totalProfit: 0
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
        stats.dailySales += grandTotal; stats.dailyProfit += orderProfit;
      }
      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal; stats.weeklyProfit += orderProfit;
      }
      if (orderDate >= startOfMonth) {
        stats.monthlySales += grandTotal; stats.monthlyProfit += orderProfit;
      }
      if (orderDate >= startOfYear) {
        stats.yearlySales += grandTotal; stats.yearlyProfit += orderProfit;
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error in analytics' });
  }
};

// ==================== 10. ACTIVITY LOGS ====================
// 1. Okuggyayo activity logs mu ngeri entuufu
exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find({ 
            $or: [
              { user: req.user.id },
              { userId: req.user.id }
            ] 
        })
            .populate('userId', 'username name')
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Bw'oba okola Edit/Add/Delete (Ekyokulabirako mu Edit Product)
exports.editProduct = async (req, res) => {
    try {
        await ActivityLog.create({
            action: 'EDIT',
            productName: product.name,
            details: `Store Qty: ${oldQty} -> ${newQty}`,
            userId: req.user ? req.user.id : null,
            user: req.user ? req.user.id : null,
            employeeName: req.user ? (req.user.name || req.user.username) : 'Unknown'
        });

        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};