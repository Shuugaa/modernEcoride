// backend/routes/employe.js
const express = require("express");
const router = express.Router();
const employeController = require("../controllers/employeController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.use(auth, requireRole("employe"));

router.get("/monitoring", employeController.monitoring);
router.get("/support", employeController.listSupportTickets);
router.get("/support/:id", employeController.getTicket);
router.post("/support/:id/respond", employeController.respondTicket);

module.exports = router;
