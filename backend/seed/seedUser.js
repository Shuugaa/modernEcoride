const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function seed() {
  const nom = 'admin';
  const prenom = 'Admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const role = 'administrateur';

  const hashed = await bcrypt.hash(password, 12);

  try {
    await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, roles, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [nom, prenom, email, JSON.stringify([role]), hashed]
    );

    console.log('✨ Admin user created / already exists');
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
