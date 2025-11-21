// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { auth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");

router.use(auth, requireRole("administrateur"));

router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.put("/users/:id/roles", adminController.updateUserRoles);
router.patch("/users/:id/toggle-active", auth, requireRole("administrateur"), adminController.toggleUserActive);


router.get("/trajets", adminController.listTrajets);
router.get("/stats", adminController.siteStats);
router.post("/create-employee", adminController.createEmployee);

module.exports = router;
