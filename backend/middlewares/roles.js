// backend/middleware/roles.js
function hasRole(...allowedRoles) {
  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : (req.user?.role ? [req.user.role] : []);
    const ok = allowedRoles.some(r => userRoles.includes(r));
    if (!ok) return res.status(403).json({ success: false, message: "Accès interdit" });
    next();
  };
}

module.exports = { hasRole };
