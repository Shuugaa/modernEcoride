const mongoose = require("mongoose");

const SearchLogSchema = new mongoose.Schema({
  userId: { 
    type: Number, 
    default: null 
  }, // id from PostgreSQL utilisateurs
  depart: { 
    type: String,
    required: true,
    trim: true
  },
  arrivee: { 
    type: String,
    required: true,
    trim: true
  },
  dateRecherchee: { // ✅ AJOUTER pour la date de trajet recherchée
    type: Date,
    default: null
  },
  resultatsCount: { // ✅ AJOUTER pour compter les résultats
    type: Number,
    default: 0
  },
  filters: { 
    type: mongoose.Schema.Types.Mixed 
  },
  ipAddress: { // ✅ RENOMMER ip → ipAddress
    type: String 
  },
  userAgent: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  collection: "search_logs" 
});

// Index pour performance
SearchLogSchema.index({ createdAt: -1 });
SearchLogSchema.index({ depart: 1, arrivee: 1 });
SearchLogSchema.index({ userId: 1 });

module.exports = mongoose.model("SearchLog", SearchLogSchema);