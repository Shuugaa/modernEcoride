const SearchLog = require('../models_mongo/SearchLog');

const logSearch = async (req, res, next) => {
  // ✅ LOGGER SEULEMENT SI USER CONNECTÉ
  if (!req.user || !req.user.id) {
    console.log('👻 User anonyme - Pas de log (anti-spam)');
    return next(); // ✅ Skip le logging, continue la recherche
  }

  // ✅ Ne logger que si on a depart ET arrivee
  if (!req.query.depart || !req.query.arrivee) {
    return next();
  }

  // ✅ STOCKER JUSTE LES PARAMÈTRES DE RECHERCHE
  req.searchQuery = {
    depart: req.query.depart.trim(),
    arrivee: req.query.arrivee.trim(),
    date: req.query.date,
    prix_max: req.query.prix_max,
    places_min: req.query.places_min
  };

  // ✅ INTERCEPTER LA RÉPONSE pour compter les résultats
  const originalSend = res.send;
  res.send = function(data) {
    // ✅ DOUBLE CHECK que l'user est toujours connecté
    if (!req.user || !req.user.id) {
      originalSend.call(this, data);
      return;
    }

    const searchParams = {
      userId: req.user.id, // ✅ Toujours un user connecté ici !
      depart: req.searchQuery.depart,
      arrivee: req.searchQuery.arrivee,
      filters: {
        date: req.searchQuery.date,
        prix_max: req.searchQuery.prix_max,
        places_min: req.searchQuery.places_min,
        resultats: 0
      },
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };

    // Compter les résultats
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        if (parsedData.success && parsedData.trajets) {
          searchParams.filters.resultats = parsedData.trajets.length;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }

    // Logger de manière asynchrone
    logToMongo(searchParams);
    
    // Envoyer la réponse normale
    originalSend.call(this, data);
  };

  next();
};

// ✅ FONCTION SÉPARÉE pour le logging
const logToMongo = async (searchParams) => {
  try {
    await SearchLog.create(searchParams);
    console.log(`🔍 SEARCH LOGGED (USER CONNECTÉ): ${searchParams.depart} → ${searchParams.arrivee} (${searchParams.filters?.resultats || 0} résultats) by user ${searchParams.userId}`);
  } catch (error) {
    console.error('❌ Erreur log recherche MongoDB:', error);
  }
};

module.exports = { logSearch };