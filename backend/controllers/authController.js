// backend/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
require("dotenv").config();

const JWT_EXPIRES = "7d";

async function register(req, res) {
  try {
    const { nom, prenom, email, password } = req.body;
    if (!email || !password || !prenom || !nom) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [nom, prenom, email, hash]
    );
    res.json({ success: true, message: "Compte créé" });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE email = $1", [email]);
    const user = rows[0];
    if (!user) return res.status(400).json({ success: false, message: "Email inconnu" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

    // cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
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

module.exports = { register, login, me };
