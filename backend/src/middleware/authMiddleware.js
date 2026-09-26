const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Token ከ Header ላይ መቀበል
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'ምንም Token አልተላከም ወይም ፈቃድ የለዎትም (Unauthorized)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Token ማረጋገጥ (Verify)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // የተጠቃሚውን መረጃ (id, username) በ req.user ውስጥ ማስቀመጥ
    next(); // ወደ ቀጣዩ Controller/Route ማለፍ
  } catch (err) {
    return res.status(403).json({ message: 'ትክክለኛ ያልሆነ ወይም የጊዜ ገደቡ ያለፈበት Token (Invalid or expired token)' });
  }
};

module.exports = authMiddleware;