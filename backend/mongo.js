// backend/mongo.js
const mongoose = require('mongoose');
require('dotenv').config();

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('⚠️ MONGO_URI not set — skipping Mongo connection');
    return;
  }
  await mongoose.connect(uri);
  console.log('🟢 MongoDB connected');
}

module.exports = connectMongo;
