// backend/server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// const bcrypt = require('bcrypt');
// bcrypt.hash('test123', 12).then(console.log);

const connectMongo = require("./config/mongo");
const { pool } = require("./config/db");  // ← CONNECTION SQL IMPORTÉE

// Routes
const authRoutes = require("./routes/auth");
const trajetRoutes = require("./routes/trajets");
const creditRoutes = require("./routes/credits");
const vehiculeRoutes = require("./routes/vehicule");
const adminRoutes = require("./routes/admin");
const employeRoutes = require("./routes/employe");
const conducteurRoutes = require("./routes/conducteur");  // Pour les APIs conducteur
const passagerRoutes = require("./routes/passager");      // Pour les APIs passager  
const userRoutes = require("./routes/user");              // Pour become-conducteur
const analyticsRoutes = require("./routes/analytics");

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use("/auth", authRoutes);
app.use("/credits", creditRoutes);
app.use("/api/vehicules", vehiculeRoutes);
app.use("/admin", adminRoutes);
app.use("/employe", employeRoutes);
app.use("/trajets", trajetRoutes);  // Pour recherche, détails publics, etc.
app.use("/conducteur", conducteurRoutes);    // /conducteur/mes-trajets, /conducteur/nouveau-trajet, etc.
app.use("/passager", passagerRoutes);        // /passager/recherche, /passager/reservations, etc.
app.use("/user", userRoutes);             // /user/become-conducteur
app.use("/analytics", analyticsRoutes); // Nouvelles routes analytics

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
