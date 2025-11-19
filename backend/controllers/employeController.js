// backend/controllers/employeController.js
const { pool } = require("../db");

async function monitoring(req, res) {
  try {
    const activeTrajets = await pool.query(`SELECT COUNT(*) FROM trajets WHERE date_depart > now()`);
    const recentReservations = await pool.query(`SELECT COUNT(*) FROM reservations WHERE created_at > now() - INTERVAL '24 hours'`);

    res.json({
      success: true,
      monitoring: {
        active_trajets: Number(activeTrajets.rows[0].count),
        recent_reservations: Number(recentReservations.rows[0].count)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function listSupportTickets(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, u.nom, u.prenom, u.email
       FROM support_tickets s
       JOIN utilisateurs u ON u.id = s.utilisateur_id
       ORDER BY s.created_at DESC LIMIT 200`
    );
    res.json({ success: true, tickets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function getTicket(req, res) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT s.*, u.nom, u.prenom, u.email
       FROM support_tickets s
       JOIN utilisateurs u ON u.id = s.utilisateur_id
       WHERE s.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Ticket non trouvé" });
    res.json({ success: true, ticket: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function respondTicket(req, res) {
  try {
    const id = Number(req.params.id);
    const { reponse, statut } = req.body;
    const { rows } = await pool.query(
      `UPDATE support_tickets SET reponse = $1, statut = $2, updated_at = now() WHERE id = $3 RETURNING *`,
      [reponse || null, statut || "traite", id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Ticket non trouvé" });
    res.json({ success: true, ticket: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = { monitoring, listSupportTickets, getTicket, respondTicket };
