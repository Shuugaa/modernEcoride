// backend/controllers/reservationController.js
const { pool } = require("../db");

async function reserverTrajet(req, res) {
  const client = await pool.connect();
  try {
    const passagerId = req.user.id;
    const trajetId = Number(req.params.trajetId);
    const { places = 1 } = req.body;

    await client.query("BEGIN");

    const trajetQ = await client.query("SELECT prix, places_disponibles FROM trajets WHERE id = $1 FOR UPDATE", [trajetId]);
    const trajet = trajetQ.rows[0];
    if (!trajet) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Trajet introuvable" });
    }

    if (trajet.places_disponibles < places) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Pas assez de places" });
    }

    // Check credits
    const userQ = await client.query("SELECT credits FROM utilisateurs WHERE id = $1 FOR UPDATE", [passagerId]);
    const user = userQ.rows[0];
    const total = Number(trajet.prix) * Number(places);

    if (Number(user.credits) < total) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, message: "Crédits insuffisants" });
    }

    // create reservation
    const resQ = await client.query(
      `INSERT INTO reservations (trajet_id, passager_id, places_reservees, total_prix)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [trajetId, passagerId, places, total]
    );

    // update trajets places
    await client.query(
      "UPDATE trajets SET places_disponibles = places_disponibles - $1 WHERE id = $2",
      [places, trajetId]
    );

    // deduct credits
    const updated = await client.query(
      `UPDATE utilisateurs SET credits = credits - $1 WHERE id = $2 RETURNING credits`,
      [total, passagerId]
    );

    await client.query("COMMIT");

    res.json({ success: true, reservation: resQ.rows[0], credits: updated.rows[0].credits });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    client.release();
  }
}

async function mesReservations(req, res) {
  try {
    const passagerId = req.user.id;
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart, u.prenom AS conducteur_prenom, u.nom AS conducteur_nom
       FROM reservations r
       JOIN trajets t ON t.id = r.trajet_id
       JOIN utilisateurs u ON u.id = t.conducteur_id
       WHERE r.passager_id = $1 ORDER BY r.created_at DESC`,
      [passagerId]
    );
    res.json({ success: true, reservations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function historique(req, res) {
  try {
    const passagerId = req.user.id;
    const { rows } = await pool.query(
      `SELECT r.*, t.depart, t.arrivee, t.date_depart
       FROM reservations r
       JOIN trajets t ON t.id = r.trajet_id
       WHERE r.passager_id = $1 AND t.date_depart < now()
       ORDER BY t.date_depart DESC`,
      [passagerId]
    );
    res.json({ success: true, historique: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

module.exports = { reserverTrajet, mesReservations, historique };
