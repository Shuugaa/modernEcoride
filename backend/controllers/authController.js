const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
require("dotenv").config();

const register = async (req, res) => {
  const { nom, prenom, email, password, roles } = req.body;

  // Règles de validation des rôles
  const rolesPublics = ["passager", "conducteur"]; // Accessibles via register public
  const rolesRestreints = ["employe", "administrateur"]; // Seulement via admin

  // Vérifier qu'aucun rôle restreint n'est demandé via register public
  const rolesNonAutorises = roles.filter(role => rolesRestreints.includes(role));
  if (rolesNonAutorises.length > 0) {
    return res.status(403).json({ 
      success: false, 
      message: `Les rôles ${rolesNonAutorises.join(', ')} ne peuvent être attribués que par un administrateur` 
    });
  }

  // Vérifier que tous les rôles demandés sont valides
  const rolesInvalides = roles.filter(role => !rolesPublics.includes(role));
  if (rolesInvalides.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: `Rôles non autorisés: ${rolesInvalides.join(', ')}` 
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

    // ✅ PARSER LES RÔLES POUR LE TOKEN ET LA RÉPONSE
    const userRoles = typeof user.roles === 'string' 
      ? JSON.parse(user.roles) 
      : user.roles;

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roles: userRoles // ✅ Utilise les rôles parsés
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ AJOUTER LES DONNÉES USER DANS LA RÉPONSE
    res.json({ 
      success: true, 
      message: "Utilisateur créé et connecté automatiquement",
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: userRoles,
        credits: user.credits,
        active: user.active
      }
    });

  } catch (err) {
    console.error("Erreur register:", err);
    
    if (err.code === '23505' && err.constraint === 'utilisateurs_email_key') {
      return res.status(400).json({ 
        success: false, 
        message: "Cet email est déjà utilisé" 
      });
    }
    
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
    const user = rows[0];
    
    if (!user) return res.status(400).json({ success: false, message: "Email inconnu" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: "Mot de passe incorrect" });

    // ← CORRECTION : Parse les rôles depuis la base
    const userRoles = typeof user.roles === 'string' 
      ? JSON.parse(user.roles) 
      : user.roles;

    const token = jwt.sign(
      { 
        id: user.id, 
        roles: userRoles
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });

    res.json({ 
      success: true, 
      message: "Connecté",
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
    console.error("Erreur login:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function me(req, res) {
  try {
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE id = $1", [req.user.id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // ← CORRECTION : Parse les rôles 
    const userRoles = typeof user.roles === 'string' 
      ? JSON.parse(user.roles) 
      : user.roles;

    res.json({ 
      success: true, 
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
    console.error("Erreur me:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: "Déconnecté" });
};

module.exports = { register, login, me, logout };