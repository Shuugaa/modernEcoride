// backend/server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const trajetRoutes = require("./routes/trajets");
const reservationRoutes = require("./routes/reservations");
const creditRoutes = require("./routes/credits");
const adminRoutes = require("./routes/admin");
const employeRoutes = require("./routes/employe");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

// routes
app.use("/auth", authRoutes);
app.use("/trajets", trajetRoutes);
app.use("/reservations", reservationRoutes);
app.use("/credits", creditRoutes);
app.use("/admin", adminRoutes);
app.use("/employe", employeRoutes);

// simple health
app.get("/", (req, res) => res.json({ success: true, message: "Backend OK" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend démarré sur ${PORT}`));
