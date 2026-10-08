const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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

    res.json({ message: 'የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል' });
  } catch (err) {
    res.status(500).json({ message: 'ኢሜይል መላክ አልተቻለም', error: err.message });
  }
};

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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'ተጠቃሚው አልተገኘም' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
// GET /api/products/export-all
exports.exportAllUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // የዚህን ተጠቃሚ ዳታዎች ብቻ በሙሉ ከሁሉም ኮሌክሽኖች መሰብሰብ
    const [products, categories, customers, suppliers, orders] = await Promise.all([
      Product.find({ user: userId }),
      Category.find({ user: userId }),
      Customer.find({ user: userId }),
      Supplier.find({ user: userId }),
      Order.find({ user: userId })
    ]);

    res.json({
      exportDate: new Date(),
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