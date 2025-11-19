// backend/routes/trajets.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { hasRole } = require("../middleware/roles");
const { createTrajet, mesTrajets, reservationsConducteur, searchTrajets } = require("../controllers/trajetController");

router.post("/", auth, hasRole("conducteur"), createTrajet);
router.get("/mine", auth, hasRole("conducteur"), mesTrajets);
router.get("/reservations", auth, hasRole("conducteur"), reservationsConducteur);
router.get("/search", auth, searchTrajets);

module.exports = router;
