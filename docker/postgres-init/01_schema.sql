-- CREATE USER appuser WITH PASSWORD 'apppassword';
-- GRANT ALL PRIVILEGES ON DATABASE carpool TO appuser;

-- USERS
CREATE TABLE IF NOT EXISTS utilisateurs (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  roles JSONB DEFAULT '["passager"]',
  created_at TIMESTAMP DEFAULT now(),
  credits NUMERIC(8,2) DEFAULT 100
);

ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

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

-- TRAJETS (version finale)
CREATE TABLE IF NOT EXISTS trajets (
  id SERIAL PRIMARY KEY,
  conducteur_id INTEGER NOT NULL,
  vehicule_id INTEGER REFERENCES vehicules(id) ON DELETE SET NULL,
  depart VARCHAR(255) NOT NULL,
  arrivee VARCHAR(255) NOT NULL,
  date_depart TIMESTAMP NOT NULL,
  date_arrivee TIMESTAMP,                    
  places_disponibles INTEGER NOT NULL,
  places_total INTEGER NOT NULL,             
  prix NUMERIC(8,2) NOT NULL,
  distance INTEGER,                          
  duree INTEGER,                             
  statut VARCHAR(20) DEFAULT 'actif',        
  notes TEXT,                                
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- RESERVATIONS (améliorée aussi)
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  trajet_id INTEGER REFERENCES trajets(id) ON DELETE CASCADE,
  passager_id INTEGER NOT NULL,
  statut VARCHAR(40) DEFAULT 'en_attente',   -- en_attente, confirmee, annulee, terminee
  places INTEGER NOT NULL,                   -- Simplifié : places au lieu de places_reservees
  prix_total NUMERIC(8,2) NOT NULL DEFAULT 0,  -- Cohérent avec le front
  notes_passager TEXT,                       -- Notes du passager
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  statut VARCHAR(30) DEFAULT 'ouvert',
  reponse TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);


-- Optionnel : table session (connect-pg-simple peut la créer automatiquement)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);
