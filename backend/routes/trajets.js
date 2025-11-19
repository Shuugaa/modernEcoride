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
      LEFT JOIN reservations r ON t.id = r.trajet_id AND r.statut = 'confirmee'
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
       LEFT JOIN reservations r ON t.id = r.trajet_id AND r.statut = 'confirmee'
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

// Voir trajets avec réservations
router.get("/trajets-reservations", auth, async (req, res) => {
  try {
    const conducteurId = req.user.id;
    
    const trajets = await pool.query(`
      SELECT t.*,
             json_agg(
               json_build_object(
                 'id', r.id,
                 'places', r.places,
                 'prix_total', r.prix_total,
                 'statut', r.statut,
                 'date_reservation', r.date_reservation,
                 'passager_nom', u.nom,
                 'passager_prenom', u.prenom,
                 'passager_email', u.email
               ) ORDER BY r.date_reservation DESC
             ) FILTER (WHERE r.id IS NOT NULL) as reservations
      FROM trajets t
      LEFT JOIN reservations r ON t.id = r.trajet_id
      LEFT JOIN utilisateurs u ON r.passager_id = u.id
      WHERE t.conducteur_id = $1
      AND t.statut IN ('actif', 'en_cours')
      GROUP BY t.id
      ORDER BY t.date_depart ASC
    `, [conducteurId]);

    res.json({ success: true, trajets: trajets.rows });
  } catch (err) {
    console.error("Erreur trajets-réservations:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Accepter/refuser réservation
router.post("/reservations/:id/:action", auth, async (req, res) => {
  try {
    const { id, action } = req.params;
    const conducteurId = req.user.id;
    
    // Vérifier que c'est bien le conducteur du trajet
    const check = await pool.query(`
      SELECT r.*, t.conducteur_id 
      FROM reservations r 
      JOIN trajets t ON r.trajet_id = t.id 
      WHERE r.id = $1
    `, [id]);
    
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Réservation non trouvée" });
    }
    
    if (check.rows[0].conducteur_id !== conducteurId) {
      return res.status(403).json({ success: false, message: "Non autorisé" });
    }
    
    const newStatut = action === 'accept' ? 'confirmee' : 'refusee';
    
    await pool.query(
      "UPDATE reservations SET statut = $1 WHERE id = $2",
      [newStatut, id]
    );

    res.json({ success: true, message: `Réservation ${newStatut}` });
  } catch (err) {
    console.error("Erreur action réservation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Changer statut trajet
router.put("/trajets/:id/statut", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const conducteurId = req.user.id;
    
    // Vérifier propriété
    const check = await pool.query(
      "SELECT * FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [id, conducteurId]
    );
    
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });
    }
    
    await pool.query(
      "UPDATE trajets SET statut = $1 WHERE id = $2",
      [statut, id]
    );

    res.json({ success: true, message: `Trajet ${statut}` });
  } catch (err) {
    console.error("Erreur statut trajet:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;