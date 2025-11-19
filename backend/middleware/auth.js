// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function auth(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Non authentifié" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, roles } (roles is TEXT[] from DB)
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
}

module.exports = { auth };
