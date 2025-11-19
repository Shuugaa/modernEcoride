const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

// Middleware pour vérifier le rôle conducteur
const requireConducteur = (req, res, next) => {
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('conducteur')) {
    return res.status(403).json({ 
      success: false, 
      message: "Accès réservé aux conducteurs" 
    });
  }
  next();
};

// Créer un nouveau trajet
router.post("/nouveau-trajet", auth, requireConducteur, async (req, res) => {
  const { depart, arrivee, date_depart, prix, places_disponibles } = req.body;
  
  try {
    const newTrajet = await pool.query(
      `INSERT INTO trajets (conducteur_id, depart, arrivee, date_depart, prix, places_disponibles) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, depart, arrivee, date_depart, prix, places_disponibles]
    );

    res.json({ 
      success: true, 
      message: "Trajet créé avec succès",
      trajet: newTrajet.rows[0]
    });
  } catch (err) {
    console.error("Erreur création trajet:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mes trajets
router.get("/mes-trajets", auth, requireConducteur, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, COUNT(r.id) as nb_reservations
       FROM trajets t
       LEFT JOIN reservations r ON t.id = r.trajet_id AND r.statut = 'confirmee'
       WHERE t.conducteur_id = $1
       GROUP BY t.id
       ORDER BY t.date_depart DESC`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      trajets: rows 
    });
  } catch (err) {
    console.error("Erreur mes trajets:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mes réservations reçues
router.get("/reservations", auth, requireConducteur, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, t.prix,
              u.nom, u.prenom, u.email
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       JOIN utilisateurs u ON r.passager_id = u.id
       WHERE t.conducteur_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      reservations: rows 
    });
  } catch (err) {
    console.error("Erreur réservations:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Accepter/Refuser une réservation
router.put("/reservations/:id/statut", auth, requireConducteur, async (req, res) => {
  const { statut } = req.body; // "confirmee" ou "refusee"
  
  try {
    // Vérifier que la réservation appartient à un trajet du conducteur
    const { rows } = await pool.query(
      `SELECT r.* FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.id = $1 AND t.conducteur_id = $2`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Réservation non trouvée" 
      });
    }

    await pool.query(
      "UPDATE reservations SET statut = $1 WHERE id = $2",
      [statut, req.params.id]
    );

    res.json({ 
      success: true, 
      message: `Réservation ${statut === 'confirmee' ? 'acceptée' : 'refusée'}` 
    });
  } catch (err) {
    console.error("Erreur update réservation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Statistiques conducteur
router.get("/stats", auth, requireConducteur, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
         COUNT(DISTINCT t.id) as nb_trajets,
         COUNT(DISTINCT r.id) as nb_reservations,
         COALESCE(SUM(CASE WHEN r.statut = 'confirmee' THEN t.prix ELSE 0 END), 0) as revenus_total
       FROM trajets t
       LEFT JOIN reservations r ON t.id = r.trajet_id
       WHERE t.conducteur_id = $1`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      stats: stats.rows[0] 
    });
  } catch (err) {
    console.error("Erreur stats:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;