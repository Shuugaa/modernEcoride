const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

router.post("/toggle-conducteur", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE id = $1", [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    console.log('🔍 Backend - user.roles:', user.roles, typeof user.roles);

    // Parsing robuste
    let currentRoles;
    if (Array.isArray(user.roles)) {
      currentRoles = user.roles;
    } else if (typeof user.roles === 'string') {
      try {
        currentRoles = JSON.parse(user.roles);
      } catch (e) {
        currentRoles = user.roles.split(',').map(r => r.trim());
      }
    } else {
      currentRoles = user.role ? [user.role] : ['passager'];
    }

    console.log('🔍 Backend - currentRoles:', currentRoles);

    // Toggle conducteur
    let newRoles;
    if (currentRoles.includes('conducteur')) {
      newRoles = currentRoles.filter(role => role !== 'conducteur');
    } else {
      newRoles = [...currentRoles, 'conducteur'];
    }

    // Assurer qu'il y a au moins "passager"
    if (newRoles.length === 0) {
      newRoles = ['passager'];
    }

    console.log('🔍 Backend - newRoles:', newRoles);

    await pool.query(
      "UPDATE utilisateurs SET roles = $1 WHERE id = $2",
      [JSON.stringify(newRoles), userId]
    );

    res.json({
      success: true,
      roles: newRoles,  // Renvoyer l'array au frontend
      message: newRoles.includes('conducteur') 
        ? "Vous êtes maintenant conducteur !" 
        : "Vous n'êtes plus conducteur"
    });

  } catch (err) {
    console.error("Erreur toggle-conducteur:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Récupérer le profil utilisateur
router.get("/profile", auth, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE id = $1", [req.user.id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const userRoles = JSON.parse(user.roles);

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roles: userRoles,
        credits: user.credits,
        created_at: user.created_at,
        active: user.active
      }
    });

  } catch (err) {
    console.error("Erreur profile:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// Mettre à jour le profil
router.put("/profile", auth, async (req, res) => {
  const { nom, prenom } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE utilisateurs SET nom = $1, prenom = $2 WHERE id = $3 RETURNING *",
      [nom, prenom, req.user.id]
    );

    const user = rows[0];
    const userRoles = JSON.parse(user.roles);

    res.json({ 
      success: true, 
      message: "Profil mis à jour",
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
    console.error("Erreur update profile:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;