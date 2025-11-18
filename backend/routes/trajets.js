// backend/routes/trajets.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const requireAuth = require("../middlewares/auth");
const { requireRole } = require("../middlewares/roles");

// Optionnel : logs de recherche MongoDB
let SearchLog = null;
try {
  SearchLog = require("../models/SearchLog");
} catch (e) {
  console.log("Mongo non utilisé pour les logs (SearchLog absent)");
}

// ------------------------------------------------------
// 1) Création d’un trajet (conducteur uniquement)
// ------------------------------------------------------
router.post("/add", requireAuth, requireRole("conducteur"), async (req, res) => {
  const conducteurId = req.session.user.id;
  const { depart, arrivee, date_depart, places_disponibles, prix } = req.body;

  if (!depart || !arrivee || !date_depart || !places_disponibles || !prix)
    return res.status(400).json({ success: false, message: "Champs manquants" });

  try {
    await pool.query(
      `INSERT INTO trajets (conducteur_id, depart, arrivee, date_depart, places_disponibles, prix)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [conducteurId, depart, arrivee, date_depart, places_disponibles, prix]
    );

    res.json({ success: true, message: "Trajet créé" });
  } catch (err) {
    console.error("Erreur création trajet :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ------------------------------------------------------
// 2) Recherche de trajets (public) + log facultatif Mongo
// ------------------------------------------------------
router.get("/search", async (req, res) => {
  const { depart, arrivee, dateMin, dateMax } = req.query;

  try {
    // ----------------------------------------
    // Log MongoDB optionnel
    // ----------------------------------------
    if (SearchLog) {
      await SearchLog.create({
        userId: req.session?.user?.id || null,
        depart,
        arrivee,
        dateMin: dateMin ? new Date(dateMin) : null,
        dateMax: dateMax ? new Date(dateMax) : null,
      });
    }

    // ----------------------------------------
    // Requête SQL filtrée
    // ----------------------------------------
    let query = "SELECT * FROM trajets WHERE 1=1";
    const params = [];
    let i = 1;

    if (depart) {
      query += ` AND LOWER(depart) LIKE LOWER($${i++})`;
      params.push(`%${depart}%`);
    }

    if (arrivee) {
      query += ` AND LOWER(arrivee) LIKE LOWER($${i++})`;
      params.push(`%${arrivee}%`);
    }

    if (dateMin) {
      query += ` AND date_depart >= $${i++}`;
      params.push(dateMin);
    }

    if (dateMax) {
      query += ` AND date_depart <= $${i++}`;
      params.push(dateMax);
    }

    query += " ORDER BY date_depart ASC";

    const result = await pool.query(query, params);

    res.json({ success: true, trajets: result.rows });
  } catch (err) {
    console.error("Erreur recherche trajets :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ------------------------------------------------------
// 3) Détail d’un trajet (public)
// ------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trajets WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ success: false, message: "Trajet introuvable" });

    res.json({ success: true, trajet: result.rows[0] });
  } catch (err) {
    console.error("Erreur détail trajet :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ------------------------------------------------------
// 4) Modification d’un trajet (conducteur uniquement)
// ------------------------------------------------------
router.put("/:id", requireAuth, requireRole("conducteur"), async (req, res) => {
  const conducteurId = req.session.user.id;
  const trajetId = req.params.id;

  const { depart, arrivee, date_depart, places_disponibles, prix } = req.body;

  try {
    const result = await pool.query(
      `UPDATE trajets
       SET depart=$1, arrivee=$2, date_depart=$3, places_disponibles=$4, prix=$5
       WHERE id=$6 AND conducteur_id=$7
       RETURNING *`,
      [
        depart,
        arrivee,
        date_depart,
        places_disponibles,
        prix,
        trajetId,
        conducteurId,
      ]
    );

    if (result.rowCount === 0)
      return res.status(403).json({
        success: false,
        message: "Non autorisé à modifier ce trajet",
      });

    res.json({ success: true, trajet: result.rows[0] });
  } catch (err) {
    console.error("Erreur update trajet :", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ------------------------------------------------------
// 5) Suppression d’un trajet (conducteur uniquement)
// ------------------------------------------------------
router.delete(
  "/:id",
  requireAuth,
  requireRole("conducteur"),
  async (req, res) => {
    const conducteurId = req.session.user.id;
    const trajetId = req.params.id;

    try {
      const result = await pool.query(
        `DELETE FROM trajets
         WHERE id=$1 AND conducteur_id=$2
         RETURNING id`,
        [trajetId, conducteurId]
      );

      if (result.rowCount === 0)
        return res.status(403).json({
          success: false,
          message: "Non autorisé à supprimer ce trajet",
        });

      res.json({ success: true, message: "Trajet supprimé" });
    } catch (err) {
      console.error("Erreur suppression trajet :", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }
);

module.exports = router;
