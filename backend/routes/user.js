const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { pool } = require("../config/db");

// Toggle le rôle conducteur (ajouter ou retirer)
router.post("/toggle-conducteur", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer l'utilisateur actuel
    const { rows } = await pool.query("SELECT * FROM utilisateurs WHERE id = $1", [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    const currentRoles = JSON.parse(user.roles);

    // Vérifier qu'il a au moins le rôle passager
    if (!currentRoles.includes('passager')) {
      return res.status(400).json({ 
        success: false, 
        message: "Vous devez être passager pour devenir conducteur" 
      });
    }

    // Vérifier qu'il n'est pas employé ou admin (protection)
    if (currentRoles.includes('employe') || currentRoles.includes('administrateur')) {
      return res.status(403).json({ 
        success: false, 
        message: "Les employés et administrateurs ne peuvent pas modifier leur rôle conducteur" 
      });
    }

    let newRoles;
    let action;

    if (currentRoles.includes('conducteur')) {
      // DOWNGRADE : Retirer le rôle conducteur
      newRoles = currentRoles.filter(role => role !== 'conducteur');
      action = 'removed';
    } else {
      // UPGRADE : Ajouter le rôle conducteur
      newRoles = [...currentRoles, 'conducteur'];
      action = 'added';
    }

    // Mettre à jour en base
    await pool.query(
      "UPDATE utilisateurs SET roles = $1 WHERE id = $2",
      [JSON.stringify(newRoles), userId]
    );

    // Message selon l'action
    const message = action === 'added' 
      ? "Vous êtes maintenant conducteur ! Vous pouvez créer des trajets."
      : "Rôle conducteur retiré. Vous ne pouvez plus créer de trajets.";

    res.json({ 
      success: true, 
      message,
      action,
      roles: newRoles
    });

  } catch (err) {
    console.error("Erreur toggle-conducteur:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
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