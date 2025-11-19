// backend/routes/trajets.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { createTrajet, mesTrajets, reservationsConducteur, searchTrajets } = require("../controllers/trajetController");

router.post("/", auth, requireRole("conducteur"), createTrajet);
router.get("/mine", auth, requireRole("conducteur"), mesTrajets);
router.get("/reservations", auth, requireRole("conducteur"), reservationsConducteur);
router.get("/search", searchTrajets); // allow anonymous search (or auth if you prefer)

module.exports = router;
