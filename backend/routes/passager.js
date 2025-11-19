const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

// Middleware pour vérifier le rôle passager
const requirePassager = (req, res, next) => {
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('passager')) {
    return res.status(403).json({ 
      success: false, 
      message: "Accès réservé aux passagers" 
    });
  }
  next();
};

// ────────────────────────────────────────────────────────
// RECHERCHE DE TRAJETS
// ────────────────────────────────────────────────────────

// Recherche avancée de trajets
router.get("/recherche", auth, requirePassager, async (req, res) => {
  const { depart, arrivee, date, prix_max, places_min } = req.query;
  
  try {
    let query = `
      SELECT t.*, u.nom, u.prenom, 
             (t.places_disponibles - COALESCE(COUNT(r.id), 0)) as places_restantes
      FROM trajets t
      JOIN utilisateurs u ON t.conducteur_id = u.id
      LEFT JOIN reservations r ON t.id = r.trajet_id AND r.status = 'confirmee'
      WHERE t.date_depart >= NOW()
        AND t.conducteur_id != $1
    `;
    
    const params = [req.user.id]; // Exclure ses propres trajets si il est aussi conducteur
    
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
      params.push(prix_max);
    }
    
    query += `
      GROUP BY t.id, u.nom, u.prenom
      HAVING (t.places_disponibles - COALESCE(COUNT(r.id), 0)) >= $${params.length + 1}
      ORDER BY t.date_depart ASC
    `;
    
    params.push(places_min || 1);

    const { rows } = await pool.query(query, params);

    res.json({ 
      success: true, 
      trajets: rows 
    });
  } catch (err) {
    console.error("Erreur recherche passager:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ────────────────────────────────────────────────────────
// RÉSERVATIONS
// ────────────────────────────────────────────────────────

// Réserver un trajet
router.post("/reserver/:trajetId", auth, requirePassager, async (req, res) => {
  const { places } = req.body;
  const trajetId = req.params.trajetId;
  
  try {
    // Vérifier que le trajet existe et a des places
    const { rows: trajetRows } = await pool.query(
      `SELECT t.*, 
              (t.places_disponibles - COALESCE(COUNT(r.id), 0)) as places_restantes
       FROM trajets t
       LEFT JOIN reservations r ON t.id = r.trajet_id AND r.status = 'confirmee'
       WHERE t.id = $1 AND t.date_depart > NOW()
       GROUP BY t.id`,
      [trajetId]
    );

    if (trajetRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Trajet non trouvé ou déjà passé" 
      });
    }

    const trajet = trajetRows[0];

    // Vérifier qu'il ne réserve pas son propre trajet
    if (trajet.conducteur_id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        message: "Vous ne pouvez pas réserver votre propre trajet" 
      });
    }

    // Vérifier les places disponibles
    if (trajet.places_restantes < places) {
      return res.status(400).json({ 
        success: false, 
        message: `Seulement ${trajet.places_restantes} place(s) disponible(s)` 
      });
    }

    // Vérifier qu'il n'a pas déjà réservé ce trajet
    const { rows: existingReservation } = await pool.query(
      "SELECT id FROM reservations WHERE trajet_id = $1 AND passager_id = $2",
      [trajetId, req.user.id]
    );

    if (existingReservation.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Vous avez déjà réservé ce trajet" 
      });
    }

    // Créer la réservation
    const prixTotal = trajet.prix * places;
    
    const newReservation = await pool.query(
      `INSERT INTO reservations (trajet_id, passager_id, places, prix_total, status) 
       VALUES ($1, $2, $3, $4, 'en_attente') RETURNING *`,
      [trajetId, req.user.id, places, prixTotal]
    );

    res.json({ 
      success: true, 
      message: "Réservation créée ! En attente de confirmation du conducteur.",
      reservation: newReservation.rows[0]
    });

  } catch (err) {
    console.error("Erreur réservation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mes réservations
router.get("/mes-reservations", auth, requirePassager, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, t.prix,
              u.nom as conducteur_nom, u.prenom as conducteur_prenom
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       JOIN utilisateurs u ON t.conducteur_id = u.id
       WHERE r.passager_id = $1
       ORDER BY t.date_depart DESC`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      reservations: rows 
    });
  } catch (err) {
    console.error("Erreur mes réservations:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Annuler une réservation
router.delete("/reservations/:id", auth, requirePassager, async (req, res) => {
  try {
    // Vérifier que la réservation appartient au passager
    const { rows } = await pool.query(
      `SELECT r.*, t.date_depart 
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.id = $1 AND r.passager_id = $2`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Réservation non trouvée" 
      });
    }

    const reservation = rows[0];

    // Vérifier qu'on peut encore annuler (au moins 2h avant)
    const now = new Date();
    const departDate = new Date(reservation.date_depart);
    const diffHours = (departDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible d'annuler moins de 2h avant le départ" 
      });
    }

    // Annuler la réservation
    await pool.query(
      "UPDATE reservations SET status = 'annulee' WHERE id = $1",
      [req.params.id]
    );

    res.json({ 
      success: true, 
      message: "Réservation annulée" 
    });

  } catch (err) {
    console.error("Erreur annulation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ────────────────────────────────────────────────────────
// HISTORIQUE ET STATISTIQUES
// ────────────────────────────────────────────────────────

// Historique des trajets effectués
router.get("/historique", auth, requirePassager, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, t.prix,
              u.nom as conducteur_nom, u.prenom as conducteur_prenom
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       JOIN utilisateurs u ON t.conducteur_id = u.id
       WHERE r.passager_id = $1 
         AND t.date_depart < NOW()
         AND r.status = 'confirmee'
       ORDER BY t.date_depart DESC`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      historique: rows 
    });
  } catch (err) {
    console.error("Erreur historique:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Réservations en cours (futures)
router.get("/en-cours", auth, requirePassager, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, t.prix,
              u.nom as conducteur_nom, u.prenom as conducteur_prenom, u.email as conducteur_email
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       JOIN utilisateurs u ON t.conducteur_id = u.id
       WHERE r.passager_id = $1 
         AND t.date_depart >= NOW()
         AND r.status IN ('en_attente', 'confirmee')
       ORDER BY t.date_depart ASC`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      reservations_en_cours: rows 
    });
  } catch (err) {
    console.error("Erreur réservations en cours:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Statistiques passager
router.get("/stats", auth, requirePassager, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
         COUNT(DISTINCT r.id) as nb_reservations_total,
         COUNT(DISTINCT CASE WHEN r.status = 'confirmee' AND t.date_depart < NOW() THEN r.id END) as nb_trajets_effectues,
         COUNT(DISTINCT CASE WHEN r.status = 'en_attente' THEN r.id END) as nb_en_attente,
         COALESCE(SUM(CASE WHEN r.status = 'confirmee' THEN r.prix_total ELSE 0 END), 0) as total_depense
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.passager_id = $1`,
      [req.user.id]
    );

    res.json({ 
      success: true, 
      stats: stats.rows[0] 
    });
  } catch (err) {
    console.error("Erreur stats passager:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;