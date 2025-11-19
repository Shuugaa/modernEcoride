// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.use(auth, requireRole("admin"));

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id/roles", adminController.updateUserRoles);
router.post("/users/:id/deactivate", adminController.deactivateUser);

router.get("/trajets", adminController.listTrajets);
router.get("/stats", adminController.siteStats);

module.exports = router;
