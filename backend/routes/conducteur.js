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
      `INSERT INTO trajets (conducteur_id, depart, arrivee, date_depart, prix, places_disponibles, places_total) 
        VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING *`,
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
    const { rows } = await pool.query(`
          SELECT 
            t.*,
            t.created_at,
            COUNT(r.id) as reservations_count,
            COALESCE(SUM(r.places), 0) as places_reservees_total
            FROM trajets t
            LEFT JOIN reservations r ON t.id = r.trajet_id
            WHERE t.conducteur_id = $1
            GROUP BY t.id, t.created_at
            ORDER BY t.date_depart ASC
      `,
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
// Mettre à jour le statut d'un trajet
router.put("/trajets/:id/statut", auth, requireConducteur, async (req, res) => {
  try {
    const { statut } = req.body;
    const trajetId = req.params.id;
    const conducteurId = req.user.id;

    console.log('🔍 Changement statut:', { trajetId, statut, conducteurId });

    // Validation du statut
    const statutsValides = ['actif', 'en_cours', 'termine', 'annule'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    // Vérifier que le trajet appartient au conducteur
    const { rows: checkRows } = await pool.query(
      "SELECT * FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [trajetId, conducteurId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé"
      });
    }

    const trajet = checkRows[0];

    // 💰 SI LE TRAJET EST TERMINÉ → PAYER LE CONDUCTEUR
    if (statut === 'termine') {
      console.log('💰 Trajet terminé - Calcul des paiements...');

      // Récupérer toutes les réservations confirmées
      const { rows: reservations } = await pool.query(
        `SELECT r.*, u.prenom, u.nom 
         FROM reservations r
         JOIN utilisateurs u ON r.passager_id = u.id
         WHERE r.trajet_id = $1 AND r.statut = 'confirmee'`,
        [trajetId]
      );

      console.log('💰 Réservations confirmées:', reservations);

      if (reservations.length > 0) {
        // Calculer le total à payer au conducteur
        const totalGagne = reservations.reduce((total, res) => {
          return total + parseFloat(res.prix_total);
        }, 0);

        console.log(`💰 Total à payer au conducteur: ${totalGagne}€`);

        // Créditer le conducteur
        await pool.query(
          "UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2",
          [totalGagne, conducteurId]
        );

        // Marquer toutes les réservations comme terminées
        await pool.query(
          "UPDATE reservations SET statut = 'terminee' WHERE trajet_id = $1 AND statut = 'confirmee'",
          [trajetId]
        );

        console.log(`💰 Conducteur crédité de ${totalGagne}€`);
        console.log(`✅ ${reservations.length} réservations marquées comme terminées`);
      }
    }

    // Mettre à jour le statut du trajet
    const { rows } = await pool.query(
      "UPDATE trajets SET statut = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [statut, trajetId]
    );

    console.log('✅ Statut mis à jour:', rows[0]);

    // Message personnalisé selon l'action
    let message = `Trajet ${statut} !`;
    if (statut === 'termine') {
      // Calculer le montant gagné pour le message
      const { rows: totalRows } = await pool.query(
        `SELECT COALESCE(SUM(prix_total), 0) as total_gagne
         FROM reservations 
         WHERE trajet_id = $1 AND statut = 'terminee'`,
        [trajetId]
      );
      
      const montantGagne = parseFloat(totalRows[0].total_gagne);
      message = `Trajet terminé ! Vous avez gagné ${montantGagne}€ 💰`;
    }

    res.json({
      success: true,
      trajet: rows[0],
      message
    });

  } catch (error) {
    console.error('❌ Erreur update statut trajet:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors du changement de statut: " + error.message 
    });
  }
});

// Supprimer un trajet
router.delete("/trajets/:id", auth, requireConducteur, async (req, res) => {
  try {
    const trajetId = req.params.id;
    const conducteurId = req.user.id;

    console.log('🔍 Suppression trajet:', { trajetId, conducteurId });

    // Vérifier que le trajet appartient au conducteur
    const { rows: checkRows } = await pool.query(
      "SELECT * FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [trajetId, conducteurId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé"
      });
    }

    const trajet = checkRows[0];

    // NOUVELLE LOGIQUE : Vérifier les réservations selon le statut du trajet
    if (trajet.statut === 'actif' || trajet.statut === 'en_cours') {
      // Pour trajets actifs/en cours : vérifier s'il y a des réservations confirmées
      const { rows: reservationRows } = await pool.query(
        "SELECT COUNT(*) FROM reservations WHERE trajet_id = $1 AND statut = 'confirmee'",
        [trajetId]
      );

      if (parseInt(reservationRows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer un trajet en cours avec des réservations confirmées"
        });
      }
    }
    
    // Pour trajets terminés/annulés : OK, on peut supprimer même avec des réservations terminées
    console.log(`🔍 Trajet ${trajet.statut} - Suppression autorisée`);

    // Supprimer TOUTES les réservations (en_attente, confirmee, refusee, terminee)
    const { rows: deletedReservations } = await pool.query(
      "DELETE FROM reservations WHERE trajet_id = $1 RETURNING *",
      [trajetId]
    );

    console.log(`🔍 ${deletedReservations.length} réservations supprimées`);

    // Puis supprimer le trajet
    await pool.query("DELETE FROM trajets WHERE id = $1", [trajetId]);

    console.log('✅ Trajet supprimé');

    res.json({
      success: true,
      message: `Trajet supprimé avec succès (${deletedReservations.length} réservations supprimées)`
    });

  } catch (error) {
    console.error('❌ Erreur suppression trajet:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la suppression: " + error.message 
    });
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