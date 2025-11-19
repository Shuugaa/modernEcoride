// backend/controllers/vehiculeController.js
const { pool } = require("../config/db");

async function createVehicule(req, res) {
  try {
    const conducteur_id = req.user.id;
    const { marque, modele, immatriculation, places } = req.body;
    if (!marque || !modele || !immatriculation) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    const { rows } = await pool.query(
      `INSERT INTO vehicules (conducteur_id, marque, modele, immatriculation, places)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [conducteur_id, marque, modele, immatriculation, places || 4]
    );
    res.json({ success: true, vehicule: rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Immatriculation déjà utilisée" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function getVehiculesByConducteur(req, res) {
  try {
    const conducteur_id = req.user.id;
    const { rows } = await pool.query("SELECT * FROM vehicules WHERE conducteur_id = $1 ORDER BY id DESC", [conducteur_id]);
    res.json({ success: true, vehicules: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function getAllVehicules(req, res) {
  try {
    const { rows } = await pool.query("SELECT * FROM vehicules ORDER BY id DESC LIMIT 1000");
    res.json({ success: true, vehicules: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = { createVehicule, getVehiculesByConducteur, getAllVehicules };
