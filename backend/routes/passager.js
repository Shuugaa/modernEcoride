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
      LEFT JOIN reservations r ON t.id = r.trajet_id AND r.statut IN ('confirmee', 'en_attente')
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

// Réserver un trajet (VERSION CORRIGÉE AVEC GESTION CRÉDITS)
router.post("/reserver/:trajetId", auth, requirePassager, async (req, res) => {
  const { places } = req.body;
  const trajetId = req.params.trajetId;
  
  try {
    // Commencer une transaction
    await pool.query('BEGIN');

    // 1. Vérifier le solde de crédits
    const { rows: userRows } = await pool.query(
      "SELECT credits FROM utilisateurs WHERE id = $1",
      [req.user.id]
    );

    const userCredits = userRows[0]?.credits || 0;

    // 2. Vérifier le trajet et calculer le prix
    const { rows: trajetRows } = await pool.query(
      `SELECT t.*, 
              (t.places_disponibles - COALESCE(COUNT(r.id), 0)) as places_restantes
       FROM trajets t
       LEFT JOIN reservations r ON t.id = r.trajet_id AND r.statut IN ('confirmee', 'en_attente')
       WHERE t.id = $1 AND t.date_depart > NOW()
       GROUP BY t.id`,
      [trajetId]
    );

    if (trajetRows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: "Trajet non trouvé ou déjà passé" 
      });
    }

    const trajet = trajetRows[0];
    const prixTotal = trajet.prix * places;

    // 3. Vérifications business
    if (trajet.conducteur_id === req.user.id) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: "Vous ne pouvez pas réserver votre propre trajet" 
      });
    }

    if (trajet.places_restantes < places) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Seulement ${trajet.places_restantes} place(s) disponible(s)` 
      });
    }

    // 4. ✅ VÉRIFIER LES CRÉDITS
    if (userCredits < prixTotal) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Crédits insuffisants. Vous avez ${userCredits}€, il faut ${prixTotal}€` 
      });
    }

    // 5. Vérifier pas de double réservation
    const { rows: existingReservation } = await pool.query(
      "SELECT id FROM reservations WHERE trajet_id = $1 AND passager_id = $2",
      [trajetId, req.user.id]
    );

    if (existingReservation.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: "Vous avez déjà réservé ce trajet" 
      });
    }

    // 6. ✅ DÉBITER LES CRÉDITS
    await pool.query(
      "UPDATE utilisateurs SET credits = credits - $1 WHERE id = $2",
      [prixTotal, req.user.id]
    );

    // 7. Créer la réservation
    const newReservation = await pool.query(
      `INSERT INTO reservations (trajet_id, passager_id, places, prix_total, statut) 
       VALUES ($1, $2, $3, $4, 'en_attente') RETURNING *`,
      [trajetId, req.user.id, places, prixTotal]
    );

    // Valider la transaction
    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      message: `Réservation créée ! ${prixTotal}€ débités. En attente de confirmation.`,
      reservation: newReservation.rows[0],
      nouveau_solde: userCredits - prixTotal
    });

  } catch (err) {
    await pool.query('ROLLBACK');
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

// Annuler une réservation (VERSION CORRIGÉE AVEC REMBOURSEMENT)
router.delete("/reservations/:id", auth, requirePassager, async (req, res) => {
  try {
    await pool.query('BEGIN');

    // Récupérer la réservation avec détails
    const { rows } = await pool.query(
      `SELECT r.*, t.date_depart 
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.id = $1 AND r.passager_id = $2`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: "Réservation non trouvée" 
      });
    }

    const reservation = rows[0];

    // Vérifier qu'elle n'est pas déjà annulée
    if (reservation.statut === 'annulee') {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: "Cette réservation est déjà annulée" 
      });
    }

    // Vérifier le délai d'annulation
    const now = new Date();
    const departDate = new Date(reservation.date_depart);
    const diffHours = (departDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: "Impossible d'annuler moins de 2h avant le départ" 
      });
    }

    // ✅ REMBOURSER LES CRÉDITS si la réservation était payée
    if (reservation.statut === 'confirmee' || reservation.statut === 'en_attente') {
      await pool.query(
        "UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2",
        [reservation.prix_total, req.user.id]
      );
    }

    // Annuler la réservation
    await pool.query(
      "UPDATE reservations SET statut = 'annulee' WHERE id = $1",
      [req.params.id]
    );

    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      message: `Réservation annulée. ${reservation.prix_total}€ remboursés.` 
    });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error("Erreur annulation:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ────────────────────────────────────────────────────────
// CRÉDITS
// ────────────────────────────────────────────────────────

// Consulter son solde
router.get("/credits", auth, requirePassager, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT credits FROM utilisateurs WHERE id = $1",
      [req.user.id]
    );

    res.json({ 
      success: true, 
      credits: rows[0]?.credits || 0 
    });
  } catch (err) {
    console.error("Erreur consultation crédits:", err);
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
         AND r.statut = 'confirmee'
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
         AND r.statut IN ('en_attente', 'confirmee')
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

// Statistiques passager (VERSION AMÉLIORÉE)
router.get("/stats", auth, requirePassager, async (req, res) => {
  try {
    const stats = await pool.query(
      `SELECT 
         COUNT(DISTINCT r.id) as nb_reservations_total,
         COUNT(DISTINCT CASE WHEN r.statut = 'confirmee' AND t.date_depart < NOW() THEN r.id END) as nb_trajets_effectues,
         COUNT(DISTINCT CASE WHEN r.statut = 'en_attente' THEN r.id END) as nb_en_attente,
         COUNT(DISTINCT CASE WHEN r.statut = 'annulee' THEN r.id END) as nb_annulees,
         COALESCE(SUM(CASE WHEN r.statut = 'confirmee' THEN r.prix_total ELSE 0 END), 0) as total_depense,
         COALESCE(AVG(CASE WHEN r.statut = 'confirmee' THEN r.prix_total END), 0) as prix_moyen
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.passager_id = $1`,
      [req.user.id]
    );

    // Ajouter le solde actuel
    const { rows: userRows } = await pool.query(
      "SELECT credits FROM utilisateurs WHERE id = $1",
      [req.user.id]
    );

    const result = {
      ...stats.rows[0],
      solde_actuel: userRows[0]?.credits || 0
    };

    res.json({ 
      success: true, 
      stats: result 
    });
  } catch (err) {
    console.error("Erreur stats passager:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;