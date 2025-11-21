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
  credits NUMERIC(8,2) DEFAULT 100,
  active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT now()  -- ✅ AJOUTÉ
);

-- VEHICULES
CREATE TABLE IF NOT EXISTS vehicules (
  id SERIAL PRIMARY KEY,
  conducteur_id INTEGER NOT NULL, -- référence logique vers utilisateurs.id
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  immatriculation TEXT UNIQUE NOT NULL,
  places INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()  -- ✅ AJOUTÉ
);

-- TRAJETS (version finale avec soft delete)
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
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP NULL  -- ✅ AJOUTÉ pour soft delete
);

-- RESERVATIONS (améliorée avec soft delete)
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  trajet_id INTEGER REFERENCES trajets(id) ON DELETE CASCADE,
  passager_id INTEGER NOT NULL,
  statut VARCHAR(40) DEFAULT 'en_attente',   -- en_attente, confirmee, annulee, terminee
  places INTEGER NOT NULL,                   -- Simplifié : places au lieu de places_reservees
  prix_total NUMERIC(8,2) NOT NULL DEFAULT 0,  -- Cohérent avec le front
  notes_passager TEXT,                       -- Notes du passager
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP NULL  -- ✅ AJOUTÉ pour soft delete (optionnel)
);

-- SUPPORT TICKETS
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

-- SESSION TABLE
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  PRIMARY KEY ("sid")
);

-- ✅ TRIGGERS POUR UPDATED_AT AUTOMATIQUE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_utilisateurs_updated_at
  BEFORE UPDATE ON utilisateurs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vehicules_updated_at
  BEFORE UPDATE ON vehicules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trajets_updated_at
  BEFORE UPDATE ON trajets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ✅ INDEX POUR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_trajets_deleted_at ON trajets(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trajets_statut ON trajets(statut);
CREATE INDEX IF NOT EXISTS idx_trajets_date_depart ON trajets(date_depart);
CREATE INDEX IF NOT EXISTS idx_reservations_statut ON reservations(statut);
CREATE INDEX IF NOT EXISTS idx_reservations_trajet_id ON reservations(trajet_id);
CREATE INDEX IF NOT EXISTS idx_reservations_passager_id ON reservations(passager_id);