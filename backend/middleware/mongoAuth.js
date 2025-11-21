const SearchLog = require('../models_mongo/SearchLog');

const logSearch = async (req, res, next) => {
  // Sauvegarder les paramètres de recherche
  req.searchParams = {
    userId: req.user?.id || null,
    depart: req.query.depart,
    arrivee: req.query.arrivee,
    filters: {
      date: req.query.date,
      prix_max: req.query.prix_max,
      places_min: req.query.places_min
    },
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  };

  // Continuer la requête
  res.on('finish', async () => {
    // Logger après que la réponse soit envoyée
    if (res.statusCode === 200) {
      try {
        await SearchLog.create(req.searchParams);
      } catch (error) {
        console.error('Erreur log recherche:', error);
      }
    }
  });

  next();
};

module.exports = { logSearch };