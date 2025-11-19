// routes/passager.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middlewares/auth");


// ---------------------------------------------------------
// 1) RÉSERVATIONS EN COURS (trajets à venir)
// ---------------------------------------------------------
router.get("/reservations", requireAuth, async (req, res) => {
  const utilisateurId = req.session.user.id;

  try {
    const result = await pool.query(
      `
      SELECT r.id, r.places_reservees AS places, r.total_prix AS montant,
             t.id AS trajet_id, t.depart, t.arrivee, t.date_depart
      FROM reservations r
      JOIN trajets t ON r.trajet_id = t.id
      WHERE r.passager_id = $1
        AND t.date_depart >= NOW()
      ORDER BY t.date_depart ASC
      `,
      [utilisateurId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// ---------------------------------------------------------
// 2) ANNULER UNE RÉSERVATION
// ---------------------------------------------------------
router.delete("/reservations/:id", requireAuth, async (req, res) => {
  const reservationId = req.params.id;
  const utilisateurId = req.session.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Vérifier que la réservation appartient au user
    const reservation = await client.query(
      `
      SELECT * FROM reservations
      WHERE id = $1 AND passager_id = $2
      `,
      [reservationId, utilisateurId]
    );

    if (reservation.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Réservation introuvable"
      });
    }

    const { trajet_id, places_reservees, total_prix } = reservation.rows[0];

    // Rembourser le passager
    await client.query(
      `
      UPDATE utilisateurs
      SET credits = credits + $1
      WHERE id = $2
      `,
      [total_prix, utilisateurId]
    );

    // Restaurer les places du trajet
    await client.query(
      `
      UPDATE trajets
      SET places_disponibles = places_disponibles + $1
      WHERE id = $2
      `,
      [places_reservees, trajet_id]
    );

    // Supprimer la réservation
    await client.query(
      `
      DELETE FROM reservations
      WHERE id = $1
      `,
      [reservationId]
    );

    await client.query("COMMIT");

    res.json({ success: true, message: "Réservation annulée" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    client.release();
  }
});


// ---------------------------------------------------------
// 3) HISTORIQUE DES TRAJETS (trajets passés)
// ---------------------------------------------------------
router.get("/historique", requireAuth, async (req, res) => {
  const utilisateurId = req.session.user.id;

  try {
    const result = await pool.query(
      `
      SELECT r.id, r.places_reservees AS places,
             t.depart, t.arrivee, t.date_depart
      FROM reservations r
      JOIN trajets t ON r.trajet_id = t.id
      WHERE r.passager_id = $1
        AND t.date_depart < NOW()
      ORDER BY t.date_depart DESC
      `,
      [utilisateurId]
    );

    res.json({ success: true, data: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
