const jwt = require('jsonwebtoken');
const User = require('../models/User'); // የ User model-ህን ከዚህ ጋር አገናኘው

// 1. Authentication Middleware (Token ቼክ ማድረጊያ)
const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Token አልተገኘም፤ የመግባት ፈቃድ የሎትም!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // ከ DB ላይ የተጠቃሚውን መረጃ (isActive እና nextPaymentDate ጨምሮ) እንፈልጋለን
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'ተጠቃሚው አልተገኘም!' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'ያልተረጋገጠ (Invalid) Token ነው!' });
  }
};

// 2. Subscription Check Middleware (ክፍያ ቼክ ማድረጊያ)
const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // SuperAdmin ወይም Admin ከሆነ በነፃ እንዲጠቀም ፍቀድለት
    if (user.role === 'Admin' || user.role === 'SuperAdmin') {
      return next();
    }

    const today = new Date();

    // አካውንቱ ከተዘጋ ወይም የክፍያ ቀኑ ካለፈ
    if (!user.isActive || new Date(user.nextPaymentDate) < today) {
      return res.status(403).json({
        success: false,
        isExpired: true,
        message: "የወርሃዊ አገልግሎት ክፍያ ጊዜዎ አልፏል! እባክዎን አገልግሎቱን ለማስቀጠል ክፍያ ይፈጽሙ።"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "የሴርቨር ስህተት አጋጥሟል" });
  }
};

// ሁለቱንም ለየብቻ Export እናደርጋቸዋለን
module.exports = { protect, checkSubscription };