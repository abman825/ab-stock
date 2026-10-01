const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Token ከ Header ማግኘት
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ message: 'Token አልተገኘም፣ የመግባት ፈቃድ የለዎትም!' });
  }

  try {
    // 2. Token ማረጋገጥ
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // 3. decoded የተቀበለውን ID በ req.user አድርጎ ማሳለፍ (ይህ መስመር በጣም ወሳኝ ነው!)
    req.user = decoded; // ወይም req.user = { id: decoded.id };
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'ያልተvalid Token ነው!' });
  }
};