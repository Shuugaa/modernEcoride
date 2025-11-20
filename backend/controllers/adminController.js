// backend/controllers/adminController.js
const { pool } = require("../config/db");
const bcrypt = require('bcrypt');

async function listUsers(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    const usersQ = await pool.query(
      `SELECT id, nom, prenom, email, roles, credits, created_at
       FROM utilisateurs ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ success: true, users: usersQ.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`SELECT id, nom, prenom, email, roles, credits, created_at FROM utilisateurs WHERE id = $1`, [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function updateUserRoles(req, res) {
  try {
    const id = Number(req.params.id);
    const { roles } = req.body;
    
    if (!Array.isArray(roles)) {
      return res.status(400).json({ success: false, message: "roles must be array" });
    }

    const { rows } = await pool.query(
      `UPDATE utilisateurs SET roles = $1 WHERE id = $2 RETURNING id, roles`, 
      [JSON.stringify(roles), id]
    );
    
    if (!rows[0]) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    
    console.log(`✅ Rôles mis à jour pour utilisateur ${id}:`, rows[0]);
    
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('❌ Erreur update rôles:', err);
    res.status(500).json({ success: false, message: "Erreur serveur: " + err.message });
  }
}

async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);

    const { rows } = await pool.query(
      `UPDATE utilisateurs SET roles = $1 WHERE id = $2 RETURNING id, roles`, 
      [JSON.stringify([]), id]
    );

    if (!rows[0]) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    
    console.log(`✅ Utilisateur ${id} désactivé:`, rows[0]);
    
    res.json({ 
      success: true, 
      message: "Utilisateur désactivé",
      user: rows[0]  // Retourne l'utilisateur modifié
    });
  } catch (err) {
    console.error('❌ Erreur désactivation:', err);
    res.status(500).json({ success: false, message: "Erreur serveur: " + err.message });
  }
}

async function listTrajets(req, res) {
  try {
    const conducteur_id = req.query.conducteur_id;
    let base = `SELECT t.*, u.nom AS conducteur_nom, u.prenom AS conducteur_prenom FROM trajets t LEFT JOIN utilisateurs u ON u.id = t.conducteur_id`;
    const params = [];
    if (conducteur_id) {
      base += ` WHERE t.conducteur_id = $1`;
      params.push(conducteur_id);
    }
    base += ` ORDER BY t.date_depart DESC LIMIT 500`;

    const { rows } = await pool.query(base, params);
    res.json({ success: true, trajets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function siteStats(req, res) {
  try {
    const totalUsers = await pool.query(`SELECT COUNT(*) FROM utilisateurs`);
    const totalTrajets = await pool.query(`SELECT COUNT(*) FROM trajets`);
    const totalReservations = await pool.query(`SELECT COUNT(*) FROM reservations`);
    const creditsSum = await pool.query(`SELECT COALESCE(SUM(credits),0) AS total_credits FROM utilisateurs`);

    res.json({
      success: true,
      stats: {
        users: Number(totalUsers.rows[0].count),
        trajets: Number(totalTrajets.rows[0].count),
        reservations: Number(totalReservations.rows[0].count),
        credits: Number(creditsSum.rows[0].total_credits)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

const createEmployee = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe } = req.body;

    console.log('🔍 Création employé:', { nom, prenom, email });

    // Validation des données
    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis"
      });
    }

    // Vérifier que l'email n'existe pas déjà
    const { rows: existingUser } = await pool.query(
      "SELECT id FROM utilisateurs WHERE email = $1",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà"
      });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

    // Créer l'employé avec le rôle "employe"
    const { rows } = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password_hash, roles, credits)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nom, prenom, email, roles, created_at`,
      [nom, prenom, email, hashedPassword, JSON.stringify(['employe']), 0]
    );

    const newEmployee = rows[0];

    console.log('✅ Employé créé:', newEmployee);

    res.status(201).json({
      success: true,
      message: "Employé créé avec succès",
      employee: {
        id: newEmployee.id,
        nom: newEmployee.nom,
        prenom: newEmployee.prenom,
        email: newEmployee.email,
        roles: newEmployee.roles,
        created_at: newEmployee.created_at
      }
    });

  } catch (error) {
    console.error('❌ Erreur création employé:', error);
    
    if (error.code === '23505') { // Contrainte unique
      return res.status(400).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création: " + error.message
    });
  }
};

module.exports = { listUsers, getUser, updateUserRoles, deactivateUser, listTrajets, siteStats, createEmployee };