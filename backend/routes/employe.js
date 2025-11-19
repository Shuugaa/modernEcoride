// backend/routes/employe.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { hasRole } = require("../middleware/roles");
const employeController = require("../controllers/employeController");

router.use(auth, hasRole("employe"));

router.get("/monitoring", employeController.monitoring);
router.get("/support", employeController.listSupportTickets);
router.get("/support/:id", employeController.getTicket);
router.post("/support/:id/respond", employeController.respondTicket);

module.exports = router;
