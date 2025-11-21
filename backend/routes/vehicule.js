const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

// ✅ ROUTES SPÉCIFIQUES D'ABORD !

// GET /api/vehicules/all - Tous les véhicules (admin/employé)
router.get("/all", auth, requireRole("administrateur", "employe"), vehiculeController.getAllVehicules);

// GET /api/vehicules - Mes véhicules (conducteur connecté)  
router.get("/", auth, requireRole("conducteur"), vehiculeController.getVehiculesByConducteur);

// POST /api/vehicules - Créer un véhicule
router.post("/", auth, requireRole("conducteur"), vehiculeController.createVehicule);

// PUT /api/vehicules/:id - Modifier un véhicule
router.put("/:id", auth, requireRole("conducteur"), vehiculeController.updateVehicule);

// DELETE /api/vehicules/:id - Supprimer un véhicule
router.delete("/:id", auth, requireRole("conducteur"), vehiculeController.deleteVehicule);

module.exports = router;