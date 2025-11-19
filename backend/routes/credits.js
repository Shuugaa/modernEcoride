// backend/routes/credits.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { addCredits } = require("../controllers/creditController");

router.post("/add", auth, addCredits);

module.exports = router;
