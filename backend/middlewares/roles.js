// backend/middlewares/roles.js
function requireRole(requiredRoles, options = {}) {
  // requiredRoles peut être une string ou un array
  const { requireAll = false } = options;

  // Normalize to array of lowercase strings
  const normalize = (r) => {
    if (!r) return [];
    if (Array.isArray(r)) return r.map(String).map(s => s.toLowerCase());
    return [String(r).toLowerCase()];
  };

  const required = normalize(requiredRoles);

  return (req, res, next) => {
    try {
      const user = req.session?.user;
      if (!user) return res.status(401).json({ success: false, message: 'Non authentifié' });

      // Assure-toi que user.roles existe et est un array ; accepte aussi une string ou null
      const userRoles = normalize(user.roles);

      if (required.length === 0) {
        // Aucun rôle requis — on laisse passer
        return next();
      }

      if (requireAll) {
        // Tous les rôles requis doivent être présents
        const hasAll = required.every(r => userRoles.includes(r));
        if (!hasAll) return res.status(403).json({ success: false, message: 'Accès interdit (rôles manquants)' });
      } else {
        // Au moins un rôle requis doit être présent
        const hasAny = required.some(r => userRoles.includes(r));
        if (!hasAny) return res.status(403).json({ success: false, message: 'Accès interdit' });
      }

      return next();
    } catch (err) {
      console.error('requireRole error:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  };
}

module.exports = { requireRole };
