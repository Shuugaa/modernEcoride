const express = require("express");
const router = express.Router();
const SearchLog = require("../models_mongo/SearchLog");
const { auth } = require("../middleware/auth");

// Middleware pour vérifier le rôle employé/admin
const requireEmployee = (req, res, next) => {
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('employe') && !userRoles.includes('administrateur')) {
    return res.status(403).json({ 
      success: false, 
      message: "Accès réservé aux employés" 
    });
  }
  next();
};

// Statistiques de recherche
router.get("/recherches/stats", auth, requireEmployee, async (req, res) => {
  try {
    const stats = await SearchLog.aggregate([
      {
        $group: {
          _id: null,
          total_recherches: { $sum: 1 },
          recherches_connectees: { 
            $sum: { $cond: [{ $ne: ["$userId", null] }, 1, 0] }
          },
          recherches_anonymes: { 
            $sum: { $cond: [{ $eq: ["$userId", null] }, 1, 0] }
          }
        }
      }
    ]);

    // Top destinations
    const topDestinations = await SearchLog.aggregate([
      {
        $match: {
          $or: [
            { depart: { $ne: null, $ne: "" } },
            { arrivee: { $ne: null, $ne: "" } }
          ]
        }
      },
      {
        $group: {
          _id: {
            depart: "$depart",
            arrivee: "$arrivee"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recherches par jour (dernière semaine)
    const recherchesByDay = await SearchLog.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: stats[0] || { total_recherches: 0, recherches_connectees: 0, recherches_anonymes: 0 },
      top_destinations: topDestinations,
      recherches_by_day: recherchesByDay
    });

  } catch (error) {
    console.error("Erreur stats recherches:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Historique des recherches récentes
router.get("/recherches/recent", auth, requireEmployee, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const recherches = await SearchLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SearchLog.countDocuments();

    res.json({
      success: true,
      recherches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Erreur historique recherches:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;