// backend/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");
require("dotenv").config();

const JWT_EXPIRES = "7d";
const register = async (req, res) => {
  const { nom, prenom, email, password, roles } = req.body;

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Assure-toi que roles est un array valide
    let rolesArray = Array.isArray(roles) ? roles : [roles];
    
    console.log("📋 Roles reçus:", roles);
    console.log("📋 Roles array:", rolesArray);

    const newUser = await pool.query(
      "INSERT INTO utilisateurs (nom, prenom, email, password_hash, roles) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, prenom, email, hashedPassword, JSON.stringify(rolesArray)] // ← JSON.stringify ici
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        roles: user.roles // ← JSON.parse ici
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Set le cookie JWT
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    res.json({ 
      success: true, 
      message: "Utilisateur créé et connecté automatiquement" 
    });

  } catch (err) {
  console.error("Erreur register:", err);
  
  // Gestion spécifique de l'email en doublon
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

    const token = jwt.sign({ id: user.id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });


    res.json({ success: true, message: "Connecté" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function me(req, res) {
  try {
    const id = req.user.id;
    const { rows } = await pool.query(
      "SELECT id, nom, prenom, email, roles, credits FROM utilisateurs WHERE id = $1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// backend/controllers/authController.js
const logout = async (req, res) => {
  // Supprime le cookie JWT
  res.clearCookie('token');
  res.json({ success: true, message: "Déconnecté" });
};

module.exports = { register, login, me, logout };