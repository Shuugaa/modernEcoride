// backend/models_mongo/SearchLog.js
const mongoose = require("mongoose");

const SearchLogSchema = new mongoose.Schema({
  userId: { type: Number, default: null }, // id from PostgreSQL utilisateurs
  depart: { type: String },
  arrivee: { type: String },
  filters: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: "search_logs" });

module.exports = mongoose.model("SearchLog", SearchLogSchema);
