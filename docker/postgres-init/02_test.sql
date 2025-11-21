-- ===== UTILISATEURS DE TEST =====

INSERT INTO utilisateurs (nom, prenom, email, password_hash, roles, credits) VALUES
  -- Mot de passe: "test123" pour tous
  ('Dupont', 'Marie', 'marie.dupont@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["passager"]', 150.00),
  ('Martin', 'Pierre', 'pierre.martin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["conducteur", "passager"]', 200.00),
  ('Durand', 'Sophie', 'sophie.durand@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["conducteur", "passager"]', 180.00),
  ('Moreau', 'Jean', 'jean.moreau@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["passager"]', 120.00),
  ('Petit', 'Laura', 'laura.petit@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["conducteur", "passager"]', 300.00),
  ('Bernard', 'Thomas', 'thomas.bernard@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["passager"]', 90.00),
  ('Robert', 'Emma', 'emma.robert@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["conducteur", "passager"]', 250.00),
  ('Richard', 'Lucas', 'lucas.richard@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["passager"]', 75.00),
  ('Admin', 'Super', 'admin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["administrateur", "employe", "conducteur", "passager"]', 500.00),
  ('Employe', 'John', 'employe@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewGbzKxbYsHJBv7q', '["employe", "passager"]', 200.00);

-- ===== VÉHICULES DE TEST =====

INSERT INTO vehicules (conducteur_id, marque, modele, immatriculation, places) VALUES
  (2, 'Peugeot', '208', 'AB-123-CD', 4),
  (3, 'Renault', 'Clio', 'EF-456-GH', 5),
  (5, 'Volkswagen', 'Golf', 'IJ-789-KL', 4),
  (7, 'Toyota', 'Yaris', 'MN-012-OP', 4),
  (9, 'BMW', 'Serie 3', 'QR-345-ST', 4),
  (2, 'Ford', 'Fiesta', 'UV-678-WX', 5),
  (3, 'Citroën', 'C3', 'YZ-901-AB', 4);

-- ===== TRAJETS DANS LE PASSÉ (POUR HISTORIQUE) =====

INSERT INTO trajets (conducteur_id, vehicule_id, depart, arrivee, date_depart, date_arrivee, places_disponibles, places_total, prix, distance, duree, statut, notes) VALUES
  -- Trajets terminés (pour historique)
  (2, 1, 'Paris', 'Lyon', '2024-01-15 08:00:00', '2024-01-15 12:30:00', 1, 4, 25.00, 465, 270, 'termine', 'Voyage sympa !'),
  (3, 2, 'Lyon', 'Marseille', '2024-01-20 14:00:00', '2024-01-20 17:15:00', 0, 5, 30.00, 315, 195, 'termine', 'Route côtière magnifique'),
  (5, 3, 'Marseille', 'Nice', '2024-02-05 09:30:00', '2024-02-05 12:00:00', 2, 4, 20.00, 205, 150, 'termine', 'Vue sur la mer'),
  (7, 4, 'Nice', 'Monaco', '2024-02-10 16:00:00', '2024-02-10 16:45:00', 3, 4, 15.00, 22, 45, 'termine', 'Trajet court mais efficace'),
  (2, 6, 'Paris', 'Bordeaux', '2024-02-25 07:00:00', '2024-02-25 13:30:00', 0, 5, 45.00, 580, 390, 'termine', 'Long voyage mais confortable'),
  (3, 7, 'Bordeaux', 'Toulouse', '2024-03-01 15:30:00', '2024-03-01 18:00:00', 1, 4, 22.00, 245, 150, 'termine', 'Route rapide'),
  (9, 5, 'Toulouse', 'Montpellier', '2024-03-15 10:00:00', '2024-03-15 13:30:00', 2, 4, 28.00, 245, 210, 'termine', 'Voyage détendu');

-- ===== TRAJETS FUTURS (ACTIFS) =====

INSERT INTO trajets (conducteur_id, vehicule_id, depart, arrivee, date_depart, places_disponibles, places_total, prix, distance, duree, statut, notes) VALUES
  -- Trajets à venir
  (2, 1, 'Paris', 'Lyon', '2024-12-25 08:00:00', 3, 4, 25.00, 465, 270, 'actif', 'Départ gare de Lyon'),
  (3, 2, 'Lyon', 'Marseille', '2024-12-26 14:00:00', 4, 5, 30.00, 315, 195, 'actif', 'Pause déjeuner prévue'),
  (5, 3, 'Marseille', 'Nice', '2024-12-27 09:30:00', 3, 4, 20.00, 205, 150, 'actif', 'Route panoramique'),
  (7, 4, 'Nice', 'Cannes', '2024-12-28 16:00:00', 4, 4, 12.00, 33, 40, 'actif', 'Festival de Cannes ?'),
  (2, 6, 'Paris', 'Nantes', '2025-01-05 07:30:00', 4, 5, 35.00, 385, 240, 'actif', 'Retour après fêtes'),
  (3, 7, 'Nantes', 'Rennes', '2025-01-06 15:00:00', 3, 4, 18.00, 110, 75, 'actif', 'Trajet court'),
  (9, 5, 'Paris', 'Lille', '2025-01-10 08:00:00', 4, 4, 22.00, 225, 135, 'actif', 'Direction Belgique'),
  (5, 3, 'Lille', 'Strasbourg', '2025-01-12 09:00:00', 4, 4, 40.00, 530, 315, 'actif', 'Traversée de la France'),
  (7, 4, 'Paris', 'Tours', '2025-01-15 14:00:00', 4, 4, 20.00, 240, 145, 'actif', 'Châteaux de la Loire'),
  (2, 1, 'Tours', 'Poitiers', '2025-01-16 10:30:00', 4, 4, 15.00, 102, 65, 'actif', 'Continuation vers le Sud');

-- ===== TRAJETS SUPPRIMÉS (SOFT DELETE) =====

INSERT INTO trajets (conducteur_id, vehicule_id, depart, arrivee, date_depart, places_disponibles, places_total, prix, statut, deleted_at, notes) VALUES
  (2, 1, 'Paris', 'Dijon', '2024-12-20 10:00:00', 4, 4, 20.00, 'supprime', '2024-11-20 15:30:00', 'Trajet annulé - problème véhicule'),
  (3, 2, 'Dijon', 'Besançon', '2024-12-21 16:00:00', 5, 5, 15.00, 'supprime', '2024-11-21 09:15:00', 'Plus disponible ce jour');

-- ===== RÉSERVATIONS TERMINÉES (POUR HISTORIQUE) =====

INSERT INTO reservations (trajet_id, passager_id, statut, places, prix_total, notes_passager) VALUES
  -- Réservations sur trajets terminés
  (1, 1, 'terminee', 1, 25.00, 'Très bon voyage, conducteur sympa'),
  (1, 4, 'terminee', 2, 50.00, 'Ponctuel et agréable'),
  (2, 6, 'terminee', 3, 90.00, 'Route magnifique !'),
  (2, 8, 'terminee', 2, 60.00, 'Confortable'),
  (3, 1, 'terminee', 1, 20.00, 'Vue superbe sur la côte'),
  (3, 4, 'terminee', 1, 20.00, 'Parfait pour découvrir la région'),
  (4, 6, 'terminee', 1, 15.00, 'Court mais efficace'),
  (5, 1, 'terminee', 2, 90.00, 'Long mais très bien organisé'),
  (5, 8, 'terminee', 3, 135.00, 'Excellent voyage'),
  (6, 4, 'terminee', 1, 22.00, 'Conducteur très sympa'),
  (6, 6, 'terminee', 2, 44.00, 'Route rapide'),
  (7, 1, 'terminee', 1, 28.00, 'Voyage détendu comme promis'),
  (7, 8, 'terminee', 1, 28.00, 'Bonne ambiance');

-- ===== RÉSERVATIONS CONFIRMÉES (TRAJETS FUTURS) =====

INSERT INTO reservations (trajet_id, passager_id, statut, places, prix_total, notes_passager) VALUES
  -- Réservations sur trajets futurs
  (8, 1, 'confirmee', 1, 25.00, 'Hâte de partir !'),
  (9, 4, 'confirmee', 1, 30.00, 'Merci pour ce trajet'),
  (10, 6, 'confirmee', 1, 20.00, 'Première fois sur cette route'),
  (11, 8, 'en_attente', 1, 12.00, 'En attente de confirmation'),
  (12, 1, 'confirmee', 1, 35.00, 'Retour de vacances'),
  (13, 4, 'confirmee', 1, 18.00, 'Trajet pratique'),
  (14, 6, 'en_attente', 1, 22.00, 'Direction travail');

-- ===== RÉSERVATIONS ANNULÉES =====

INSERT INTO reservations (trajet_id, passager_id, statut, places, prix_total, notes_passager) VALUES
  -- Réservations annulées (trajet supprimé ou autre)
  (18, 1, 'annulee', 1, 20.00, 'Dommage, trajet annulé'),
  (19, 4, 'annulee', 2, 30.00, 'Trajet annulé par le conducteur');

-- ===== TICKETS SUPPORT =====

INSERT INTO support_tickets (utilisateur_id, sujet, message, statut, reponse) VALUES
  (1, 'Problème de réservation', 'Je n''arrive pas à réserver un trajet', 'resolu', 'Problème résolu après mise à jour de l''app'),
  (4, 'Remboursement', 'Demande de remboursement pour trajet annulé', 'en_cours', 'Demande en cours de traitement'),
  (6, 'Bug interface', 'L''interface plante sur mobile', 'ouvert', NULL),
  (8, 'Question tarifs', 'Comment sont calculés les prix ?', 'resolu', 'Les prix sont définis par les conducteurs selon la distance et les frais');

-- ===== METTRE À JOUR LES PLACES DISPONIBLES =====
-- (Après les réservations confirmées)

UPDATE trajets SET places_disponibles = places_total - (
  SELECT COALESCE(SUM(places), 0) 
  FROM reservations 
  WHERE trajet_id = trajets.id 
    AND statut IN ('confirmee', 'en_attente')
) WHERE deleted_at IS NULL;