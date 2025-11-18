const express = require("express");
const pool = require("../db");
const router = express.Router();
const requireAuth = require("../middlewares/auth");

/* ---------------------------
   GET /vehicules
   Liste des véhicules du conducteur
---------------------------- */
router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vehicules WHERE conducteur_id = $1 ORDER BY id DESC",
      [req.session.user.id]
    );

    res.json({ success: true, vehicules: result.rows });
  } catch (err) {
    console.error("GET VEHICULES ERROR:", err);
    res.status(500).json({ success: false });
  }
});


/* ---------------------------
   POST /vehicules
   Ajouter un véhicule
---------------------------- */
router.post("/", requireAuth, async (req, res) => {
  const { marque, modele, immatriculation, places } = req.body;

  if (!marque || !modele || !immatriculation) {
    return res.status(400).json({
      success: false,
      message: "Champs requis manquants"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vehicules (conducteur_id, marque, modele, immatriculation, places)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.session.user.id, marque, modele, immatriculation, places || 4]
    );

    res.json({ success: true, vehicule: result.rows[0] });
  } catch (err) {
    console.error("CREATE VEHICULE ERROR:", err);

    if (err.code === "23505") {
      return res.json({
        success: false,
        message: "Immatriculation déjà utilisée"
      });
    }

    res.status(500).json({ success: false });
  }
});


module.exports = router;
