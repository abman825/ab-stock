const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Token ከ Header ላይ መቀበል
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'ምንም Token አልተላከም ወይም ፈቃድ የለዎትም (Unauthorized)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Token ማረጋገጫ (Secret Key ከ login ጋር ተመሳሳይ መሆን አለበት)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded; // የተጠቃሚውን መረጃ (id) በ req.user ውስጥ ማቀመጥ
    next();
  } catch (err) {
    return res.status(403).json({ message: 'ትክክለኛ ያልሆነ ወይም ጊዜው ያለፈበት Token (Invalid or expired token)' });
  }
};

module.exports = authMiddleware;