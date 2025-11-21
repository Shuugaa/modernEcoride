const { pool } = require("../config/db");

// Récupérer les véhicules du conducteur connecté
const getVehiculesByConducteur = async (req, res) => {
  try {
    const conducteurId = req.user.id;

    const { rows } = await pool.query(`
      SELECT v.*, 
             COUNT(t.id) as trajets_count
      FROM vehicules v
      LEFT JOIN trajets t ON v.id = t.vehicule_id AND t.deleted_at IS NULL
      WHERE v.conducteur_id = $1
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `, [conducteurId]);

    res.json({
      success: true,
      vehicules: rows
    });

  } catch (error) {
    console.error("Erreur récupération véhicules:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Créer un nouveau véhicule
const createVehicule = async (req, res) => {
  try {
    const conducteurId = req.user.id;
    const { marque, modele, immatriculation, places } = req.body;

    // Validation
    if (!marque || !modele || !immatriculation) {
      return res.status(400).json({
        success: false,
        message: "Marque, modèle et immatriculation sont obligatoires"
      });
    }

    // Vérifier si l'immatriculation existe déjà
    const { rows: existing } = await pool.query(
      "SELECT id FROM vehicules WHERE immatriculation = $1",
      [immatriculation]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cette immatriculation est déjà enregistrée"
      });
    }

    // Insérer le véhicule
    const { rows } = await pool.query(`
      INSERT INTO vehicules (conducteur_id, marque, modele, immatriculation, places)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [conducteurId, marque, modele, immatriculation, places || 4]);

    res.status(201).json({
      success: true,
      message: "Véhicule ajouté avec succès",
      vehicule: rows[0]
    });

  } catch (error) {
    console.error("Erreur création véhicule:", error);
    
    // Erreur contrainte unique
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: "Cette immatriculation est déjà enregistrée"
      });
    }

    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
};

// Modifier un véhicule
const updateVehicule = async (req, res) => {
  try {
    const { id } = req.params;
    const conducteurId = req.user.id;
    const { marque, modele, immatriculation, places } = req.body;

    // Vérifier que le véhicule appartient au conducteur
    const { rows: existing } = await pool.query(
      "SELECT * FROM vehicules WHERE id = $1 AND conducteur_id = $2",
      [id, conducteurId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Véhicule non trouvé"
      });
    }

    // Mettre à jour
    const { rows } = await pool.query(`
      UPDATE vehicules 
      SET marque = $1, modele = $2, immatriculation = $3, places = $4, updated_at = NOW()
      WHERE id = $5 AND conducteur_id = $6
      RETURNING *
    `, [marque, modele, immatriculation, places, id, conducteurId]);

    res.json({
      success: true,
      message: "Véhicule modifié avec succès",
      vehicule: rows[0]
    });

  } catch (error) {
    console.error("Erreur modification véhicule:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

// Supprimer un véhicule
const deleteVehicule = async (req, res) => {
  try {
    const { id } = req.params;
    const conducteurId = req.user.id;

    // Vérifier que le véhicule appartient au conducteur
    const { rows: existing } = await pool.query(
      "SELECT * FROM vehicules WHERE id = $1 AND conducteur_id = $2",
      [id, conducteurId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Véhicule non trouvé"
      });
    }

    // Vérifier s'il y a des trajets actifs avec ce véhicule
    const { rows: trajetsActifs } = await pool.query(
      "SELECT COUNT(*) FROM trajets WHERE vehicule_id = $1 AND date_depart > NOW() AND deleted_at IS NULL",
      [id]
    );

    if (parseInt(trajetsActifs[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer un véhicule avec des trajets futurs"
      });
    }

    // Supprimer le véhicule
    await pool.query(
      "DELETE FROM vehicules WHERE id = $1 AND conducteur_id = $2",
      [id, conducteurId]
    );

    res.json({
      success: true,
      message: "Véhicule supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur suppression véhicule:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

// Tous les véhicules (admin)
const getAllVehicules = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT v.*, u.nom, u.prenom,
             COUNT(t.id) as trajets_count
      FROM vehicules v
      JOIN utilisateurs u ON v.conducteur_id = u.id
      LEFT JOIN trajets t ON v.id = t.vehicule_id
      GROUP BY v.id, u.nom, u.prenom
      ORDER BY v.created_at DESC
    `);

    res.json({
      success: true,
      vehicules: rows
    });

  } catch (error) {
    console.error("Erreur récupération tous véhicules:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};

module.exports = {
  getVehiculesByConducteur,
  createVehicule,
  updateVehicule,
  deleteVehicule,
  getAllVehicules
};