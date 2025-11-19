const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middlewares/auth");

/* ------------------------------------------------------
   1) Création d’une réservation (utilisateur authentifié)
------------------------------------------------------- */
router.post("/add/:trajetId", requireAuth, async (req, res) => {
  const utilisateurId = req.session.user.id;
  const { places_reservees, prix } = req.body;
  const { trajetId } = req.params;

  if (!trajetId || !places_reservees || !prix) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Vérifier la disponibilité du trajet
    const trajetResult = await client.query(
      "SELECT places_disponibles FROM trajets WHERE id = $1 FOR UPDATE",
      [trajetId]
    );

    if (trajetResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Trajet non trouvé" });
    }

    const placesDisponibles = trajetResult.rows[0].places_disponibles;

    if (places_reservees > placesDisponibles) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Pas assez de places disponibles",
      });
    }

    // 2️⃣ Vérifier les crédits de l’utilisateur
    const userCredits = await client.query(
      "SELECT credits FROM utilisateurs WHERE id = $1 FOR UPDATE",
      [utilisateurId]
    );
    
    const prixNumber = Number(prix);
    const creditsNumber = Number(userCredits.rows[0].credits);
    if (creditsNumber < prixNumber) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Crédits insuffisants",
      });
    }

    // 3️⃣ Créer la réservation
    await client.query(
      `INSERT INTO reservations (passager_id, trajet_id, places_reservees, total_prix)
       VALUES ($1, $2, $3, $4)`,
      [utilisateurId, trajetId, places_reservees, prix]
    );

    // 4️⃣ Déduire les places disponibles
    await client.query(
      `UPDATE trajets 
       SET places_disponibles = places_disponibles - $1 
       WHERE id = $2`,
      [places_reservees, trajetId]
    );

    // 5️⃣ Déduire les crédits
    const updatedCredits = await client.query(
      `UPDATE utilisateurs
       SET credits = credits - $1
       WHERE id = $2
       RETURNING credits`,
      [prix, utilisateurId]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Réservation créée avec succès",
      credits: updatedCredits.rows[0].credits,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    client.release();
  }
});

/* ------------------------------------------------------
   2) Liste des réservations de l'utilisateur connecté
------------------------------------------------------- */
router.get("/mine", requireAuth, async (req, res) => {
  const utilisateurId = req.session.user.id;

  try {
    const result = await pool.query(
      `SELECT r.id, r.places_reservees, r.total_prix, 
              t.depart, t.arrivee, t.date_depart, t.conducteur_id
       FROM reservations r
       JOIN trajets t ON r.trajet_id = t.id
       WHERE r.passager_id = $1
       ORDER BY t.date_depart ASC`,
      [utilisateurId]
    );

    res.json({
      success: true,
      reservations: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

module.exports = router;
