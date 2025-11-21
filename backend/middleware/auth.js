const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Token manquant" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Token invalide" });
  }
};

// ✅ NOUVEAU: Auth optionnelle pour les recherches publiques
const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    console.log(`⚠️ Token invalide, user anonyme`); // ✅ DEBUG
    req.user = null;
    next();
  }
};
  
module.exports = { auth, optionalAuth };