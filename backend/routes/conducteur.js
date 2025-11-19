// routes/conducteur.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middlewares/auth");


// ---------------------------------------------------------------------
// 1️⃣ OBTENIR LES TRAJETS DU CONDUCTEUR
// ---------------------------------------------------------------------
router.get("/trajets", requireAuth, async (req, res) => {
  const conducteurId = req.session.user.id;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM trajets
      WHERE conducteur_id = $1
      ORDER BY date_depart ASC
      `,
      [conducteurId]
    );

    res.json({ success: true, trajets: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// ---------------------------------------------------------------------
// 2️⃣ AJOUTER UN NOUVEAU TRAJET
// ---------------------------------------------------------------------
router.post("/trajets", requireAuth, async (req, res) => {
  const conducteurId = req.session.user.id;
  const {
    depart,
    arrivee,
    date_depart,
    prix,
    places_disponibles
  } = req.body;

  if (!depart || !arrivee || !date_depart || !prix || !places_disponibles) {
    return res.status(400).json({
      success: false,
      message: "Tous les champs sont requis"
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO trajets (conducteur_id, depart, arrivee, date_depart, prix, places_disponibles)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [conducteurId, depart, arrivee, date_depart, prix, places_disponibles]
    );

    res.json({ success: true, message: "Trajet créé" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// ---------------------------------------------------------------------
// 3️⃣ MODIFIER UN TRAJET
// ---------------------------------------------------------------------
router.put("/trajets/:id", requireAuth, async (req, res) => {
  const trajetId = req.params.id;
  const conducteurId = req.session.user.id;

  const {
    depart,
    arrivee,
    date_depart,
    prix,
    places_disponibles
  } = req.body;

  try {
    // Vérifier que le trajet appartient au conducteur
    const check = await pool.query(
      "SELECT id FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [trajetId, conducteurId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    await pool.query(
      `
      UPDATE trajets
      SET depart = $1,
          arrivee = $2,
          date_depart = $3,
          prix = $4,
          places_disponibles = $5
      WHERE id = $6
      `,
      [depart, arrivee, date_depart, prix, places_disponibles, trajetId]
    );

    res.json({ success: true, message: "Trajet mis à jour" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// ---------------------------------------------------------------------
// 4️⃣ SUPPRIMER UN TRAJET
// ---------------------------------------------------------------------
router.delete("/trajets/:id", requireAuth, async (req, res) => {
  const trajetId = req.params.id;
  const conducteurId = req.session.user.id;

  try {
    const check = await pool.query(
      "SELECT id FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [trajetId, conducteurId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    await pool.query("DELETE FROM trajets WHERE id = $1", [trajetId]);

    res.json({ success: true, message: "Trajet supprimé" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


// ---------------------------------------------------------------------
// 5️⃣ VOIR LES RÉSERVATIONS D’UN TRAJET
// ---------------------------------------------------------------------
router.get("/trajets/:id/reservations", requireAuth, async (req, res) => {
  const trajetId = req.params.id;
  const conducteurId = req.session.user.id;

  try {
    // Vérifier que le trajet appartient au conducteur
    const check = await pool.query(
      "SELECT id FROM trajets WHERE id = $1 AND conducteur_id = $2",
      [trajetId, conducteurId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas le conducteur de ce trajet"
      });
    }

    const result = await pool.query(
      `
      SELECT r.id, r.places_reservees AS places, r.total_prix AS paiement,
             u.prenom, u.nom
      FROM reservations r
      JOIN utilisateurs u ON u.id = r.passager_id
      WHERE r.trajet_id = $1
      `,
      [trajetId]
    );

    res.json({ success: true, reservations: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


module.exports = router;
