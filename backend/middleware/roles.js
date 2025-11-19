// backend/middleware/roles.js
function requireRole(...allowed) {
  return (req, res, next) => {
    const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : (req.user?.role ? [req.user.role] : []);
    const ok = allowed.some(r => userRoles.includes(r));
    if (!ok) return res.status(403).json({ success: false, message: "Accès interdit" });
    next();
  };
}

module.exports = { requireRole };
