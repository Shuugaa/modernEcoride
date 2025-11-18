const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/auth");
const pool = require("../db");

// Récupérer le solde de crédits
router.get("/", requireAuth, (req, res) => {
  res.json({
    success: true,
    credits: req.session.user.credits
  });
});

// Ajouter des crédits
router.post("/add", requireAuth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }

  try {
    await pool.query(
      "UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2",
      [amount, req.session.user.id]
    );

    // mettre à jour la session
    req.session.user.credits += amount;

    return res.json({
      success: true,
      credits: req.session.user.credits
    });

  } catch (err) {
    console.error("CREDITS ADD ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Déduire des crédits
router.post("/spend", requireAuth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Montant invalide" });
  }

  if (req.session.user.credits < amount) {
    return res.status(400).json({ success: false, message: "Crédits insuffisants" });
  }

  try {
    await pool.query(
      "UPDATE utilisateurs SET credits = credits - $1 WHERE id = $2",
      [amount, req.session.user.id]
    );

    req.session.user.credits -= amount;

    return res.json({
      success: true,
      credits: req.session.user.credits
    });

  } catch (err) {
    console.error("CREDITS SPEND ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
