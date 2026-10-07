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

    if (user.role === 'Admin' || user.role === 'SuperAdmin') {
      return next();
    }

    const today = new Date();
    const expiryDate = new Date(user.nextPaymentDate);
    
    // የቀረውን ቀን ማስላት
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. ቀኑ ሙሉ በሙሉ ካለፈ ወይም isActive: false ከሆነ መቆለፍ
    if (user.isActive === false || diffDays <= 0) {
      return res.status(403).json({
        success: false,
        isExpired: true,
        message: "የወርሃዊ አገልግሎት ክፍያ ጊዜዎ አልፏል! እባክዎን አገልግሎቱን ለማስቀጠል ክፍያ ይፈጽሙ።"
      });
    }

    // 2. ቀሪው ቀን ከ 5 ቀን በታች ከሆነ ለ Front-end መረጃ መስጠት
    if (diffDays <= 5) {
      req.subscriptionWarning = {
        showWarning: true,
        daysLeft: diffDays,
        message: `የአገልግሎት ጊዜዎ ሊያልቅ ${diffDays} ቀን ብቻ ቀርቶታል! እባክዎን ክፍያ ይፈጽሙ።`
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "የሴርቨር ስህተት አጋጥሟል" });
  }
};