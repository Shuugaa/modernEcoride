// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { hasRole } = require("../middleware/roles");
const adminController = require("../controllers/adminController");

router.use(auth, hasRole("admin"));

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id/roles", adminController.updateUserRoles);
router.post("/users/:id/deactivate", adminController.deactivateUser);

router.get("/trajets", adminController.listTrajets);
router.get("/stats", adminController.siteStats);

module.exports = router;
