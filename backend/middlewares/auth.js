// backend/middlewares/auth.js
module.exports = function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ success: false, message: 'Non authentifié' });
};
