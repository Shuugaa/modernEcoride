// backend/middlewares/roles.js
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ success: false, message: 'Non authentifié' });
    if (req.session.user.role !== role) return res.status(403).json({ success: false, message: 'Accès interdit' });
    next();
  };
}

module.exports = { requireRole };
