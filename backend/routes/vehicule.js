// backend/routes/vehicule.js
const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehiculeController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.post("/", auth, requireRole("conducteur"), vehiculeController.createVehicule);
router.get("/mine", auth, requireRole("conducteur"), vehiculeController.getVehiculesByConducteur);
router.get("/", auth, requireRole("admin"), vehiculeController.getAllVehicules);

module.exports = router;
