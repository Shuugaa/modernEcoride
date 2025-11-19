const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();

  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ success: false, message: "Token invalide" });
  }
}

module.exports = { auth };