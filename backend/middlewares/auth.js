// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Non authentifié" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should contain { id, roles }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
}

module.exports = { auth };
