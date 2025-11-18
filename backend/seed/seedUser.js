const pool = require('../db');
const bcrypt = require('bcrypt');

async function seed() {
  const nom = 'admin';
  const prenom = 'Admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const role = 'conducteur';

  const hashed = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      `INSERT INTO utilisateurs (nom, prenom, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [nom, prenom, email, hashed, role]
    );
    console.log('Seeded admin user');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
