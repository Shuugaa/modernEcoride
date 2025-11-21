// backend/middleware/roles.js
function requireRole(role) {
  return (req, res, next) => {
    let roles = req.user?.roles;
    if (typeof roles === "string") {
      try { roles = JSON.parse(roles); } catch { roles = [roles]; }
    }
    if (!Array.isArray(roles)) roles = [];
    console.log("Roles du user:", roles, "Role requis:", role); // ← DEBUG
    if (!roles.includes(role)) {
      return res.status(403).json({ success: false, message: "Accès interdit" });
    }
    next();
  };
}

module.exports = { requireRole };