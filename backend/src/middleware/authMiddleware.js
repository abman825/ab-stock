const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Authentication Middleware
const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Token አልተገኘም! የመግባት ፈቃድ የለዎትም።' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // Načtení uživatele z DB
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

// 2. Subscription Check Middleware
const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // Admin nebo SuperAdmin mají neomezený přístup
    if (user.role === 'Admin' || user.role === 'SuperAdmin') {
      return next();
    }

    const today = new Date();
    const expiryDate = new Date(user.nextPaymentDate);
    
    // Výpočet zbývajících dnů
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. Pokud předplatné vypršelo nebo isActive === false
    if (user.isActive === false || diffDays <= 0) {
      return res.status(403).json({
        success: false,
        isExpired: true,
        message: "የወርሃዊ አገልግሎት ክፍያ ጊዜዎ አልቋል! እባክዎን አገልግሎቱን ለማስቀጠል ክፍያ ይፈፅሙ።"
      });
    }

    // 2. Pokud zbývá 5 a méně dní, přimícháme subscriptionWarning do každé res.json odpovědi
    if (diffDays <= 5) {
      const originalJson = res.json;
      res.json = function (data) {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          data.subscriptionWarning = {
            showWarning: true,
            daysLeft: diffDays,
            message: `የአገልግሎት ጊዜዎ ሊያልቅ ${diffDays} ቀን ብቻ ቀርቶታል! እባክዎን ክፍያ ይፈፅሙ።`
          };
        }
        return originalJson.call(this, data);
      };
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "የሰርቨር ስህተት አጋጥሟል" });
  }
};

module.exports = { protect, checkSubscription };