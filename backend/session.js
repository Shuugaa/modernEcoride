// backend/session.js
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');
require('dotenv').config();

module.exports = session({
  store: new pgSession({
    pool,
    tableName: 'session'
  }),
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: Number(process.env.SESSION_MAXAGE) || 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false, // en prod avec HTTPS => true
    sameSite: 'lax'
  }
});
