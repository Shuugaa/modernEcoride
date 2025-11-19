// backend/config/mongo.js
const mongoose = require("mongoose");
require("dotenv").config();

async function connectMongo() {
  const url = process.env.MONGO_URL || process.env.MONGO_URI || "mongodb://localhost:27017/carpool";
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connecté");
  } catch (err) {
    console.error("Erreur connexion MongoDB:", err);
    throw err;
  }
}

module.exports = connectMongo;
