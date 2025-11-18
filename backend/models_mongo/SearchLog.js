// backend/models_mongo/SearchLog.js
const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema({
  userId: { type: Number, required: false },
  depart: String,
  arrivee: String,
  dateMin: Date,
  dateMax: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SearchLog', SearchLogSchema);
