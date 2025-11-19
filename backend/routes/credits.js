// backend/routes/credits.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { addCredits, getCredits } = require("../controllers/creditController");

router.get("/", auth, getCredits);

router.post("/add", auth, addCredits);

module.exports = router;
