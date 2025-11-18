-- CREATE USER appuser WITH PASSWORD 'apppassword';
-- GRANT ALL PRIVILEGES ON DATABASE carpool TO appuser;

-- USERS
CREATE TABLE IF NOT EXISTS utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  roles TEXT[] DEFAULT ARRAY['passager'],
  created_at TIMESTAMP DEFAULT now(),
  credits NUMERIC(8,2) DEFAULT 100
);

-- VEHICULES
CREATE TABLE IF NOT EXISTS vehicules (
  id SERIAL PRIMARY KEY,
  conducteur_id INTEGER NOT NULL, -- référence logique vers utilisateurs.id
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  immatriculation TEXT UNIQUE NOT NULL,
  places INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP DEFAULT now()
);

-- TRAJETS
CREATE TABLE IF NOT EXISTS trajets (
  id SERIAL PRIMARY KEY,
  conducteur_id INTEGER NOT NULL,
  vehicule_id INTEGER REFERENCES vehicules(id) ON DELETE SET NULL,
  depart VARCHAR(255) NOT NULL,
  arrivee VARCHAR(255) NOT NULL,
  date_depart TIMESTAMP NOT NULL,
  places_disponibles INTEGER NOT NULL,
  prix NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  trajet_id INTEGER REFERENCES trajets(id) ON DELETE CASCADE,
  passager_id INTEGER NOT NULL, -- utilisateurs.id
  statut VARCHAR(40) DEFAULT 'en_attente',
  places_reservees INTEGER NOT NULL,
  total_prix NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Optionnel : table session (connect-pg-simple peut la créer automatiquement)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);
