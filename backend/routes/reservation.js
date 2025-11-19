// backend/routes/reservation.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const { reserverTrajet, mesReservations, historique } = require("../controllers/reservationController");

router.post("/:trajetId", auth, requireRole("passager"), reserverTrajet);
router.get("/mine", auth, requireRole("passager"), mesReservations);
router.get("/historique", auth, requireRole("passager"), historique);

module.exports = router;
