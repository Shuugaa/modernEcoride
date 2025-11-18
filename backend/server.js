// backend/server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./session");
const connectMongo = require("./mongo");
const pool = require("./db");

const authRoutes = require("./routes/auth");
const vehiculesRoutes = require("./routes/vehicules");
const trajetsRoutes = require("./routes/trajets");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------- Middlewares globaux ----------
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS complet (sessions + préflight)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type"
  })
);

// Répondre globalement aux OPTIONS (préflight)
app.options("*", cors());

app.use(sessionMiddleware);

// --------- Connexions DB ----------
connectMongo().catch(err => console.error("Mongo error:", err));

// --------- Routes ----------
app.use("/auth", authRoutes);
app.use("/vehicules", vehiculesRoutes);
app.use("/trajets", trajetsRoutes);
app.use("/credits", require("./routes/credits"));


app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
