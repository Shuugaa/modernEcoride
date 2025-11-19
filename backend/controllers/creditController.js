const { pool } = require("../config/db");

// Voir mes crédits
async function getCredits(req, res) {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      "SELECT credits FROM utilisateurs WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Utilisateur non trouvé" 
      });
    }

    res.json({ 
      success: true, 
      credits: result.rows[0].credits 
    });

  } catch (error) {
    console.error('Erreur récupération crédits:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des crédits" 
    });
  }
}

async function addCredits(req, res) {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!amount || amount <= 0 || amount > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: "Montant invalide (entre 1 et 1000)" 
      });
    }

    // Ajouter les crédits
    const result = await pool.query(
      "UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2 RETURNING credits",
      [amount, userId]
    );

    res.json({ 
      success: true, 
      credits: result.rows[0].credits,
      message: `${amount} crédits ajoutés !`
    });

  } catch (error) {
    console.error('Erreur ajout crédits:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'ajout de crédits" 
    });
  }
}

module.exports = { addCredits, getCredits };