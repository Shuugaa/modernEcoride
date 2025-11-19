// backend/controllers/creditController.js
const { pool } = require("../config/db");

async function addCredits(req, res) {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount))) return res.status(400).json({ success: false, message: "Montant invalide" });

    const { rows } = await pool.query(`UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2 RETURNING credits`, [amount, userId]);
    res.json({ success: true, credits: rows[0].credits });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = { addCredits };
