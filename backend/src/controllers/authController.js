const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'እባክዎን ኢሜይል ያስገቡ' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'በዚህ ኢሜይል የተመዘገበ ተጠቃሚ አልተገኘም' });

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
      html: `<a href="${resetUrl}">የይለፍ ቃል ቀይር</a>`
    });

    res.json({ message: 'የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተላክዋል' });
  } catch (err) {
    res.status(500).json({ message: 'ኢሜይል መላክ አልተቻለም', error: err.message });
  }
};

// 2. Register
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'እባክዎን ሁሉንም አስፈላጊ መረጃዎች ያስገቡ!' });
    }

    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username ወይም Email ቀደም ብሎ ተመዝግቧል!' });
    }

    const newUser = new User({ username, email, password, fullName: fullName || '', phone: phone || '' });
    await newUser.save();
    res.status(201).json({ message: 'ተጠቃሚው በተሳካ ሁኔታ ተመዝግቧል!' });
  } catch (err) {
    res.status(500).json({ message: 'ምዝገባው አልተሳካም!', error: err.message });
  }
};

// 3. Login
exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginInput = username || email;

    const user = await User.findOne({ $or: [{ username: loginInput }, { email: loginInput }] });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'የተሳሳተ Username/Email ወይም Password!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    const userData = user.toObject();
    delete userData.password;

    res.json({ message: 'በተሳካ ሁኔታ ገብተዋል!', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'መግባት አልተቻለም!', error: err.message });
  }
};

// 4. Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'ተጠቃሚው አልተገኘም' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Update Profile
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

// 6. Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "የነበረው ፓስወርድ ትክክለኛ አይደለም!" });
    }

    user.password = newPassword; 
    await user.save();
    res.json({ message: "ፓስወርድዎ በተሳካ ሁኔታ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) return res.status(400).json({ message: 'ሊንኩ ጊዜው አልፏል ወይም ትክክለኛ አይደለም' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'ፓስወርድዎ በተሳካ ሁኔታ ተቀይሯል፤ አሁን መግባት ይችላሉ' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. EXPORT ALL DATA (Filter by Business Type)
exports.exportAllUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessType } = req.query;

    let bFilter = { user: userId };
    
    if (businessType && businessType !== 'undefined' && businessType !== 'null') {
      if (businessType.includes('building')) {
        bFilter.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        bFilter.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    const [products, categories, customers, suppliers, orders] = await Promise.all([
      Product.find(bFilter),
      Category.find(bFilter),
      Customer.find({ user: userId }),
      Supplier.find({ user: userId }),
      Order.find(bFilter)
    ]);

    res.json({
      exportDate: new Date(),
      businessType: businessType || 'pharmacy',
      products,
      categories,
      customers,
      suppliers,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: "መረጃዎችን ማውረድ አልተቻለም፦ " + err.message });
  }
};

exports.importAllUserData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, categories, customers, suppliers, orders, businessType } = req.body;
    const currentBusinessType = businessType || 'pharmacy';

    // 1. Categories Import (ነባሩን categoryId ሳይቀይርና ሳይደግም ማስገባት)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        await Category.updateOne(
          { name: cat.name, user: userId },
          { 
            $setOnInsert: { 
              name: cat.name, 
              categoryId: cat.categoryId || Math.floor(1000 + Math.random() * 9000).toString(),
              user: userId, 
              businessType: currentBusinessType 
            } 
          },
          { upsert: true }
        );
      }
    }

    // 2. Products Import
    if (products && Array.isArray(products) && products.length > 0) {
      const preparedProducts = products.map(item => {
        const { _id, createdAt, updatedAt, ...rest } = item;
        return {
          ...rest,
          user: userId,
          businessType: currentBusinessType
        };
      });
      await Product.insertMany(preparedProducts);
    }

    // 3. Customers Import
    if (customers && Array.isArray(customers) && customers.length > 0) {
      for (const cust of customers) {
        await Customer.updateOne(
          { phone: cust.phone, user: userId },
          { 
            $setOnInsert: { 
              name: cust.name, 
              phone: cust.phone, 
              email: cust.email || '', 
              address: cust.address || '', 
              totalDebt: cust.totalDebt || 0, 
              user: userId 
            } 
          },
          { upsert: true }
        );
      }
    }

    // 4. Suppliers Import
    if (suppliers && Array.isArray(suppliers) && suppliers.length > 0) {
      for (const sup of suppliers) {
        await Supplier.updateOne(
          { name: sup.name, user: userId },
          { 
            $setOnInsert: { 
              name: sup.name, 
              phone: sup.phone || '', 
              email: sup.email || '', 
              user: userId 
            } 
          },
          { upsert: true }
        );
      }
    }

    // 5. Orders ( የሽያጭ መዝገቦች / Invoices) Import
    if (orders && Array.isArray(orders) && orders.length > 0) {
      const preparedOrders = orders.map(ord => {
        const { _id, createdAt, updatedAt, ...rest } = ord;
        return {
          ...rest,
          user: userId,
          businessType: currentBusinessType,
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date()
        };
      });
      await Order.insertMany(preparedOrders);
    }

    res.json({ message: 'ሁሉም መረጃዎች (የሽያጭ መዝገብን ጨምሮ) በተሳካ ሁኔታ ተመልሰዋል!' });
  } catch (err) {
    res.status(500).json({ error: "መረጃዎችን ማስገባት አልተቻለም፦ " + err.message });
  }
};