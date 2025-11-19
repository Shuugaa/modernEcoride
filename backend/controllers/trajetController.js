// backend/controllers/trajetController.js
const { pool } = require("../config/db");
const SearchLog = require("../models_mongo/SearchLog");

async function createTrajet(req, res) {
  try {
    const conducteurId = req.user.id;
    const { depart, arrivee, date_depart, places_disponibles, prix, vehicule_id } = req.body;
    if (!depart || !arrivee || !date_depart || !places_disponibles || !prix) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    const { rows } = await pool.query(
      `INSERT INTO trajets (conducteur_id, vehicule_id, depart, arrivee, date_depart, places_disponibles, prix)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [conducteurId, vehicule_id || null, depart, arrivee, date_depart, places_disponibles, prix]
    );
    res.json({ success: true, trajet: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function mesTrajets(req, res) {
  try {
    const conducteurId = req.user.id;
    const { rows } = await pool.query("SELECT * FROM trajets WHERE conducteur_id = $1 ORDER BY date_depart DESC", [conducteurId]);
    res.json({ success: true, trajets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function reservationsConducteur(req, res) {
  try {
    const conducteurId = req.user.id;
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, u.prenom AS passager_prenom, u.nom AS passager_nom
       FROM reservations r
       JOIN trajets t ON t.id = r.trajet_id
       JOIN utilisateurs u ON u.id = r.passager_id
       WHERE t.conducteur_id = $1
       ORDER BY r.created_at DESC`,
      [conducteurId]
    );
    res.json({ success: true, reservations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function searchTrajets(req, res) {
  try {
    const { depart = "", arrivee = "" } = req.query;
    const qDepart = `%${depart}%`;
    const qArrivee = `%${arrivee}%`;

    // write to Mongo search log (best-effort)
    try {
      await SearchLog.create({
        userId: req.user?.id ?? null,
        depart,
        arrivee,
        filters: req.query || {},
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });
    } catch (e) {
      console.warn("SearchLog failed:", e);
    }

    const { rows } = await pool.query(
      `SELECT t.*, u.prenom AS conducteur_prenom, u.nom AS conducteur_nom
       FROM trajets t
       LEFT JOIN utilisateurs u ON u.id = t.conducteur_id
       WHERE t.depart ILIKE $1 AND t.arrivee ILIKE $2 AND t.date_depart > now()
       ORDER BY t.date_depart ASC
       LIMIT 200`,
      [qDepart, qArrivee]
    );
    res.json({ success: true, trajets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = { createTrajet, mesTrajets, reservationsConducteur, searchTrajets };
