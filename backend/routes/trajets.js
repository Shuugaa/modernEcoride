const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

// ────────────────────────────────────────────────────────
// ROUTES PUBLIQUES UNIQUEMENT
// ────────────────────────────────────────────────────────

// Rechercher des trajets (public)
// REMPLACE la route search dans trajets.js :
router.get("/search", async (req, res) => {
  const { depart, arrivee, date, prix_max, places_min } = req.query;
  
  try {
    let query = `
      SELECT 
        t.*,
        u.nom, 
        u.prenom,
        t.places_disponibles as places_restantes
      FROM trajets t
      JOIN utilisateurs u ON t.conducteur_id = u.id
      WHERE t.statut = 'actif' AND t.date_depart >= NOW()
    `;
    
    const params = [];
    
    if (depart) {
      query += ` AND LOWER(t.depart) LIKE LOWER($${params.length + 1})`;
      params.push(`%${depart}%`);
    }
    
    if (arrivee) {
      query += ` AND LOWER(t.arrivee) LIKE LOWER($${params.length + 1})`;
      params.push(`%${arrivee}%`);
    }
    
    if (date) {
      query += ` AND DATE(t.date_depart) = $${params.length + 1}`;
      params.push(date);
    }
    
    if (prix_max) {
      query += ` AND t.prix <= $${params.length + 1}`;
      params.push(parseFloat(prix_max));
    }
    
    if (places_min && places_min > 1) {
      query += ` AND t.places_disponibles >= $${params.length + 1}`;
      params.push(parseInt(places_min));
    }
    
    query += ` ORDER BY t.date_depart ASC`;

    console.log('🔍 Query:', query);
    console.log('🔍 Params:', params);

    const { rows } = await pool.query(query, params);

    console.log('🔍 Results:', rows.length);

    res.json({ 
      success: true, 
      trajets: rows 
    });
  } catch (err) {
    console.error("❌ Erreur recherche trajets:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur: " + err.message 
    });
  }
});

// Détails d'un trajet (public)
router.get("/:id", async (req, res) => {
  try {
    // Récupérer le trajet
    const { rows: trajetRows } = await pool.query(
      "SELECT * FROM trajets WHERE id = $1",
      [req.params.id]
    );

    if (trajetRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé"
      });
    }

    const trajet = trajetRows[0];

    // Récupérer les infos conducteur avec stats
    const { rows: conducteurRows } = await pool.query(
      `SELECT 
        u.id, 
        u.nom, 
        u.prenom, 
        u.email,
        COUNT(t.id) as trajets_effectues
      FROM utilisateurs u
      LEFT JOIN trajets t ON t.conducteur_id = u.id AND t.statut = 'termine'
      WHERE u.id = $1
      GROUP BY u.id, u.nom, u.prenom, u.email`,
      [trajet.conducteur_id]
    );

    const conducteur = conducteurRows[0] || {};
    
    res.json({
      success: true,
      trajet: {
        ...trajet,
        conducteur: {
          id: conducteur.id,
          nom: conducteur.nom,
          prenom: conducteur.prenom,
          email: conducteur.email,
          rating: 4.5,
          trajets_effectues: parseInt(conducteur.trajets_effectues) || 0
        }
      }
    });
  } catch (err) {
    console.error("❌ Erreur détail trajet:", err);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur: " + err.message 
    });
  }
});

module.exports = router;