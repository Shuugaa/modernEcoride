// backend/server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectMongo = require("./config/mongo");
const authRoutes = require("./routes/auth");
const trajetRoutes = require("./routes/trajets");
const reservationRoutes = require("./routes/reservation");
const creditRoutes = require("./routes/credits");
const vehiculeRoutes = require("./routes/vehicule");
const adminRoutes = require("./routes/admin");
const employeRoutes = require("./routes/employe");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS — allow frontend + credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Routes
app.use("/auth", authRoutes);
app.use("/trajets", trajetRoutes);
app.use("/reservations", reservationRoutes);
app.use("/credits", creditRoutes);
app.use("/api/vehicules", vehiculeRoutes);
app.use("/admin", adminRoutes);
app.use("/employe", employeRoutes);

// health
app.get("/", (req, res) => res.json({ success: true, message: "Backend OK" }));

const PORT = process.env.PORT || 5000;
connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend démarré sur ${PORT}`));
  })
  .catch(err => {
    console.error("Impossible de démarrer sans Mongo:", err);
    process.exit(1);
  });
