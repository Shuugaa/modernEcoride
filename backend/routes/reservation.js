// backend/routes/reservations.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { hasRole } = require("../middleware/roles");
const { reserverTrajet, mesReservations, historique } = require("../controllers/reservationController");

router.post("/:trajetId", auth, hasRole("passager"), reserverTrajet);
router.get("/mine", auth, hasRole("passager"), mesReservations);
router.get("/historique", auth, hasRole("passager"), historique);

module.exports = router;
