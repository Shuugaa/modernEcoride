// backend/routes/employe.js
const express = require("express");
const router = express.Router();
const employeController = require("../controllers/employeController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { pool } = require("../config/db");

router.use(auth, requireRole("employe"));

// ✅ SUPPORT - Routes existantes
router.get("/monitoring", employeController.monitoring);
router.get("/support", employeController.listSupportTickets);
router.get("/support/:id", employeController.getTicket);
router.post("/support/:id/respond", employeController.respondTicket);

// ➕ GESTION UTILISATEURS - Routes manquantes
router.get("/utilisateurs", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.*,
        COUNT(DISTINCT t.id) as nb_trajets_conducteur,
        COUNT(DISTINCT r.id) as nb_reservations_passager,
        COALESCE(SUM(CASE WHEN t.statut = 'termine' THEN 
          (SELECT SUM(prix_total) FROM reservations WHERE trajet_id = t.id AND statut = 'terminee')
        END), 0) as revenus_conducteur
      FROM utilisateurs u
      LEFT JOIN trajets t ON u.id = t.conducteur_id
      LEFT JOIN reservations r ON u.id = r.passager_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      utilisateurs: rows
    });
  } catch (err) {
    console.error("Erreur liste utilisateurs:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Modifier un utilisateur
router.put("/utilisateurs/:id", async (req, res) => {
  try {
    const { roles, credits, actif } = req.body;
    const userId = req.params.id;

    console.log('🔍 Modification utilisateur:', { userId, roles, credits, actif });

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (roles !== undefined) {
      updates.push(`roles = $${paramCounter++}`);
      values.push(JSON.stringify(roles));
    }

    if (credits !== undefined) {
      updates.push(`credits = $${paramCounter++}`);
      values.push(parseFloat(credits));
    }

    if (actif !== undefined) {
      updates.push(`actif = $${paramCounter++}`);
      values.push(actif);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune modification spécifiée"
      });
    }

    values.push(userId);

    const { rows } = await pool.query(
      `UPDATE utilisateurs 
       SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCounter} 
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      utilisateur: rows[0],
      message: "Utilisateur modifié avec succès"
    });

  } catch (error) {
    console.error('❌ Erreur modification utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur: " + error.message 
    });
  }
});

// ➕ GESTION TRAJETS
router.get("/trajets", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        t.*,
        u.nom as conducteur_nom,
        u.prenom as conducteur_prenom,
        u.email as conducteur_email,
        COUNT(DISTINCT r.id) as nb_reservations,
        COALESCE(SUM(CASE WHEN r.statut = 'confirmee' OR r.statut = 'terminee' THEN r.places ELSE 0 END), 0) as places_reservees,
        COALESCE(SUM(CASE WHEN r.statut = 'terminee' THEN r.prix_total ELSE 0 END), 0) as revenus_generes
      FROM trajets t
      JOIN utilisateurs u ON t.conducteur_id = u.id
      LEFT JOIN reservations r ON t.id = r.trajet_id
      GROUP BY t.id, u.id, u.nom, u.prenom, u.email
      ORDER BY t.created_at DESC
      LIMIT 100
    `);

    res.json({
      success: true,
      trajets: rows
    });
  } catch (err) {
    console.error("Erreur liste trajets:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Modérer un trajet
router.put("/trajets/:id/moderate", async (req, res) => {
  try {
    const { statut, motif } = req.body;
    const trajetId = req.params.id;

    console.log('🔍 Modération trajet:', { trajetId, statut, motif });

    const statutsValides = ['actif', 'en_cours', 'termine', 'annule', 'suspendu'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: "Statut invalide"
      });
    }

    // Ajouter une note de modération
    const noteModeration = `\n[MODÉRATION ${new Date().toLocaleString()}] ${motif || 'Modifié par un employé'}`;

    const { rows } = await pool.query(
      `UPDATE trajets 
       SET statut = $1, notes = COALESCE(notes, '') || $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [statut, noteModeration, trajetId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Trajet non trouvé"
      });
    }

    res.json({
      success: true,
      trajet: rows[0],
      message: `Trajet ${statut}. ${motif || 'Modération appliquée'}`
    });

  } catch (error) {
    console.error('❌ Erreur modération trajet:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur: " + error.message 
    });
  }
});

// ➕ STATISTIQUES AVANCÉES
router.get("/dashboard", async (req, res) => {
  try {
    // Stats générales
    const { rows: generalStats } = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM utilisateurs) as total_utilisateurs,
        (SELECT COUNT(*) FROM utilisateurs WHERE roles::text LIKE '%conducteur%') as total_conducteurs,
        (SELECT COUNT(*) FROM trajets) as total_trajets,
        (SELECT COUNT(*) FROM trajets WHERE statut = 'actif') as trajets_actifs,
        (SELECT COUNT(*) FROM reservations) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE statut = 'confirmee') as reservations_actives,
        (SELECT COALESCE(SUM(credits), 0) FROM utilisateurs) as credits_circulation
    `);

    // Revenus par mois (derniers 6 mois)
    const { rows: monthlyRevenue } = await pool.query(`
      SELECT 
        DATE_TRUNC('month', r.created_at) as mois,
        COALESCE(SUM(r.prix_total), 0) as revenus
      FROM reservations r
      WHERE r.statut = 'terminee' 
        AND r.created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', r.created_at)
      ORDER BY mois DESC
    `);

    // Top conducteurs
    const { rows: topConducteurs } = await pool.query(`
      SELECT 
        u.nom, u.prenom, u.email,
        COUNT(DISTINCT t.id) as nb_trajets,
        COALESCE(SUM(CASE WHEN r.statut = 'terminee' THEN r.prix_total END), 0) as revenus_total
      FROM utilisateurs u
      JOIN trajets t ON u.id = t.conducteur_id
      LEFT JOIN reservations r ON t.id = r.trajet_id
      WHERE u.roles::text LIKE '%conducteur%'
      GROUP BY u.id
      HAVING COUNT(DISTINCT t.id) > 0
      ORDER BY revenus_total DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        general: generalStats[0],
        revenus_mensuels: monthlyRevenue,
        top_conducteurs: topConducteurs
      }
    });

  } catch (error) {
    console.error('❌ Erreur dashboard employé:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur: " + error.message 
    });
  }
});

// ➕ GESTION FINANCIÈRE
router.post("/utilisateurs/:id/crediter", async (req, res) => {
  try {
    const { montant, motif } = req.body;
    const userId = req.params.id;

    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: "Montant invalide"
      });
    }

    const { rows } = await pool.query(
      "UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2 RETURNING *",
      [parseFloat(montant), userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    console.log(`💰 Crédit utilisateur ${userId}: +${montant}€ (${motif})`);

    res.json({
      success: true,
      utilisateur: rows[0],
      message: `${montant}€ crédités. Motif: ${motif || 'Crédit employé'}`
    });

  } catch (error) {
    console.error('❌ Erreur crédit utilisateur:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur: " + error.message 
    });
  }
});

module.exports = router;