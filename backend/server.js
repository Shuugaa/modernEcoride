// backend/server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectMongo = require("./config/mongo");
const { pool } = require("./config/db");  // ← CONNECTION SQL IMPORTÉE

// Routes
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

// CORS
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

// Vérifier PostgreSQL avant de lancer
async function ensurePostgres(retries = 10) {
  while (retries > 0) {
    try {
      await pool.query("SELECT NOW()");
      console.log("PostgreSQL connecté");
      return;
    } catch (err) {
      console.log("Postgres pas prêt, retry...");
      retries--;
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  throw new Error("Impossible de se connecter à PostgreSQL");
}


// health
app.get("/", (req, res) => res.json({ success: true, message: "Backend OK" }));

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await ensurePostgres();  // ← CHECK SQL
    await connectMongo();    // ← CHECK NOSQL

    app.listen(PORT, () => {
      console.log(`Backend démarré sur ${PORT}`);
    });

  } catch (err) {
    console.error("Erreur critique au démarrage :", err);
    process.exit(1);
  }
})();
