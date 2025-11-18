// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../db");
const router = express.Router();
const requireAuth = require("../middlewares/auth");

const SALT_ROUNDS = 10;
const VALID_ROLES = ["passager", "conducteur"];

// ---------------------------
// POST /auth/register
// ---------------------------
router.post("/register", async (req, res) => {
  const { nom, prenom, email, password, roles } = req.body;

  try {
    if (!nom || !prenom || !email || !password || !roles)
      return res.status(400).json({ success: false, message: "Champs manquants" });

    if (!Array.isArray(roles) || roles.length === 0 || !roles.every(r => VALID_ROLES.includes(r))) {
      return res.status(400).json({ success: false, message: "Rôles invalides" });
    }
    
    // Vérifier si email existe déjà
    const check = await pool.query(
      "SELECT id FROM utilisateurs WHERE email = $1 LIMIT 1",
      [email]
    );
    if (check.rows.length > 0)
      return res.status(409).json({ success: false, message: "Email déjà utilisé" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password_hash, roles, credits)
       VALUES ($1, $2, $3, $4, $5, 100)
       RETURNING id, nom, prenom, email, roles, credits`,
      [nom, prenom, email, hashed, roles]
    );


    const user = result.rows[0];

    // Création session automatique
    req.session.user = user;

    res.json({ success: true, user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ---------------------------
// POST /auth/login
// ---------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN BODY:", req.body);

  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Champs manquants" });

    const result = await pool.query(
      `SELECT id, nom, prenom, email, roles, credits, password_hash
       FROM utilisateurs WHERE email = $1 LIMIT 1`,
      [email]
    );


    const user = result.rows[0];
    if (!user)
      return res.status(401).json({ success: false, message: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res.status(401).json({ success: false, message: "Identifiants invalides" });

    delete user.password_hash;
    req.session.user = user;

    res.json({
      success: true,
      user: {
        id: user.id,
        prenom: user.prenom,
        email: user.email,
        roles: user.roles,
        credits: user.credits
      }
    });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  });

// ---------------------------
// POST /auth/logout
// ---------------------------
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ success: false });
    }

    res.clearCookie("sid", {
      path: "/",        // OBLIGATOIRE
      httpOnly: true,   // doit matcher le cookie
      sameSite: "lax",  // doit matcher le cookie
      secure: false     // doit matcher le cookie
    });

    return res.json({ success: true });
  });
});

// ---------------------------
// GET /auth/me
// ---------------------------
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: {
      id: req.session.user.id,
      prenom: req.session.user.prenom,
      email: req.session.user.email,
      roles: req.session.user.roles,
      credits: req.session.user.credits
    }
  });
});


// ---------------------------
// GET /auth/private/profile
// ---------------------------
router.get("/private/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const result = await pool.query(
      "SELECT id, nom, prenom, email, roles FROM utilisateurs WHERE id = $1",
      [userId]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
