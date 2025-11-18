const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middlewares/auth");

// ------------------------------------------------------
// 1) Création d’une réservation (utilisateur authentifié)
// ------------------------------------------------------
router.post("/add/:trajetId", requireAuth, async (req, res) => {
  const utilisateurId = req.session.user.id;
  const { places_reservees } = req.body;
  const { trajetId } = req.params;

  if (!trajetId || !places_reservees)
    return res.status(400).json({ success: false, message: "Champs manquants" });

  try {
    // Vérifier la disponibilité des places
    const trajetResult = await pool.query(
      "SELECT places_disponibles FROM trajets WHERE id = $1",
      [trajetId]
    );

    if (trajetResult.rows.length === 0)
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });

    const placesDisponibles = trajetResult.rows[0].places_disponibles;

    if (places_reservees > placesDisponibles)
      return res.status(400).json({ success: false, message: "Pas assez de places disponibles" });

    // Créer la réservation
    await pool.query(
      `INSERT INTO reservations (passager_id, trajet_id, places_reservees)
       VALUES ($1, $2, $3)`,
      [utilisateurId, trajetId, places_reservees]
    );

    // Mettre à jour les places disponibles
    await pool.query(
      "UPDATE trajets SET places_disponibles = places_disponibles - $1 WHERE id = $2",
      [places_reservees, trajetId]
    );

    res.json({ success: true, message: "Réservation créée avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;