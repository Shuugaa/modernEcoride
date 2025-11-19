// backend/controllers/adminController.js
const { pool } = require("../config/db");

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
    if (!Array.isArray(roles)) return res.status(400).json({ success: false, message: "roles must be array" });

    const { rows } = await pool.query(`UPDATE utilisateurs SET roles = $1 WHERE id = $2 RETURNING id, roles`, [roles, id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function deactivateUser(req, res) {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`UPDATE utilisateurs SET roles = ARRAY[]::text[] WHERE id = $1 RETURNING id`, [id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    res.json({ success: true, message: "Utilisateur désactivé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
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
async function createEmployee(req, res) {
  const { nom, prenom, email, password, roles } = req.body;

  // Vérifier que l'utilisateur connecté est admin
  const userRoles = req.user.roles || [];
  if (!userRoles.includes('administrateur')) {
    return res.status(403).json({ 
      success: false, 
      message: "Seuls les administrateurs peuvent créer des employés" 
    });
  }

  const rolesAutorises = ["passager", "conducteur", "employe", "administrateur"];
  const rolesValides = roles.every(role => rolesAutorises.includes(role));
  
  if (!rolesValides) {
    return res.status(400).json({ 
      success: false, 
      message: "Rôles non autorisés" 
    });
  }

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let rolesArray = Array.isArray(roles) ? roles : [roles];

    const newUser = await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, email, password_hash, roles) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, prenom, email, hashedPassword, JSON.stringify(rolesArray)]
    );

    const user = newUser.rows[0];
    const userRoles = JSON.parse(user.roles);

    res.json({ 
      success: true, 
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: userRoles,
        credits: user.credits
      }
    });

  } catch (err) {
    console.error("Erreur createEmployee:", err);
    
    if (err.code === '23505' && err.constraint === 'utilisateurs_email_key') {
      return res.status(400).json({ 
        success: false, 
        message: "Cet email est déjà utilisé" 
      });
    }
    
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}
  
module.exports = { listUsers, getUser, updateUserRoles, deactivateUser, listTrajets, siteStats, createEmployee };