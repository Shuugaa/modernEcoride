const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

// ────────────────────────────────────────────────────────
// ROUTES PUBLIQUES/GÉNÉRIQUES SEULEMENT
// (Supprimer toutes les routes conducteur spécifiques)
// ────────────────────────────────────────────────────────

// Rechercher des trajets (public)
router.get("/search", async (req, res) => {
  const { depart, arrivee, date } = req.query;
  
  try {
    let query = `
      SELECT t.*, u.nom, u.prenom, 
             (t.places_disponibles - COALESCE(COUNT(r.id), 0)) as places_restantes
      FROM trajets t
      JOIN utilisateurs u ON t.conducteur_id = u.id
      LEFT JOIN reservations r ON t.id = r.trajet_id AND r.status = 'confirmee'
      WHERE t.date_depart >= NOW()
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
    
    query += `
      GROUP BY t.id, u.nom, u.prenom
      HAVING (t.places_disponibles - COALESCE(COUNT(r.id), 0)) > 0
      ORDER BY t.date_depart ASC
    `;

    const { rows } = await pool.query(query, params);

    res.json({ 
      success: true, 
      trajets: rows 
    });
  } catch (err) {
    console.error("Erreur recherche trajets:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Détails d'un trajet (public)
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.nom, u.prenom, u.email,
              (t.places_disponibles - COALESCE(COUNT(r.id), 0)) as places_restantes
       FROM trajets t
       JOIN utilisateurs u ON t.conducteur_id = u.id
       LEFT JOIN reservations r ON t.id = r.trajet_id AND r.status = 'confirmee'
       WHERE t.id = $1
       GROUP BY t.id, u.nom, u.prenom, u.email`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Trajet non trouvé" 
      });
    }

    res.json({ 
      success: true, 
      trajet: rows[0] 
    });
  } catch (err) {
    console.error("Erreur détails trajet:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Tous les trajets (pour admin uniquement)
router.get("/all", auth, async (req, res) => {
  // Vérifier que c'est un admin
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('administrateur')) {
    return res.status(403).json({ 
      success: false, 
      message: "Accès réservé aux administrateurs" 
    });
  }

  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.nom, u.prenom, u.email,
              COUNT(r.id) as nb_reservations
       FROM trajets t
       JOIN utilisateurs u ON t.conducteur_id = u.id
       LEFT JOIN reservations r ON t.id = r.trajet_id
       GROUP BY t.id, u.nom, u.prenom, u.email
       ORDER BY t.created_at DESC`
    );

    res.json({ 
      success: true, 
      trajets: rows 
    });
  } catch (err) {
    console.error("Erreur liste trajets admin:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;