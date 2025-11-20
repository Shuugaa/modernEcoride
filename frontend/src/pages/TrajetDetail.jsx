import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { apiFetch } from "../api/apiClient";

export default function TrajetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [trajet, setTrajet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationLoading, setReservationLoading] = useState(false);
  const [placesAReserver, setPlacesAReserver] = useState(1);

  useEffect(() => {
    loadTrajet();
  }, [id]);

  const loadTrajet = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/trajets/${id}`);

      if (data.success) {
        setTrajet(data.trajet);
      } else {
        setError(data.message || "Trajet non trouvé");
      }
    } catch (err) {
      console.error("Erreur chargement trajet:", err);
      setError("Impossible de charger le trajet");
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (placesAReserver > trajet.places_disponibles) {
      alert("Pas assez de places disponibles");
      return;
    }

    setReservationLoading(true);

    try {
      const data = await apiFetch(`/passager/reserver/${trajet.id}`, {
        method: "POST",
        body: JSON.stringify({
          places: placesAReserver
        })
      });

    if (data.success) {
      alert("Réservation effectuée avec succès ! En attente de confirmation du conducteur.");

      // Recharger le trajet pour voir les places mises à jour
      loadTrajet();

      // Rediriger vers les réservations
      navigate("/dashboard/passager/en-cours");
    } else {
      alert(data.message || "Erreur lors de la réservation");
    }
  } catch (err) {
    console.error("Erreur réservation:", err);
    alert("Erreur lors de la réservation");
  } finally {
    setReservationLoading(false);
  }
};

if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">🔄 Chargement du trajet...</div>
        </div>
      </div>
    </div>
  );
}

if (error || !trajet) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Trajet non trouvé</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/recherche"
            className="inline-flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
          >
            ← Retour à la recherche
          </Link>
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isOwner = user && user.id === trajet.conducteur_id;
const canReserve = user && !isOwner && trajet.places_disponibles > 0;

return (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Header avec retour */}
      <div className="mb-6">
        <Link
          to="/recherche"
          className="inline-flex items-center text-brand-dark hover:text-brand-verydark mb-4"
        >
          ← Retour à la recherche
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {trajet.depart} → {trajet.arrivee}
        </h1>
        <p className="text-gray-600 mt-2">
          📅 {formatDate(trajet.date_depart)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">

          {/* Détails du trajet */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Détails du trajet</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">🚩</span>
                  <span className="font-medium">Départ</span>
                </div>
                <p className="text-gray-900 font-medium">{trajet.depart}</p>
                <p className="text-sm text-gray-600">
                  {new Date(trajet.date_depart).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600">🎯</span>
                  <span className="font-medium">Arrivée</span>
                </div>
                <p className="text-gray-900 font-medium">{trajet.arrivee}</p>
                <p className="text-sm text-gray-600">
                  Environ {new Date(trajet.date_arrivee).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-lg text-brand-dark">{trajet.prix}€</div>
                <div className="text-sm text-gray-600">Prix par place</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-lg text-green-600">{trajet.places_disponibles}</div>
                <div className="text-sm text-gray-600">Places restantes</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-lg text-purple-600">{trajet.places_total}</div>
                <div className="text-sm text-gray-600">Places total</div>
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-lg text-orange-600">
                  {Math.round((trajet.distance || 0) / 1000)} km
                </div>
                <div className="text-sm text-gray-600">Distance</div>
              </div>
            </div>

            {trajet.description && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {trajet.description}
                </p>
              </div>
            )}
          </div>

          {/* Informations conducteur */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Votre conducteur</h2>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-lg">
                  {trajet.conducteur?.prenom} {trajet.conducteur?.nom}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>📧 {trajet.conducteur?.email}</div>
                  <div className="flex items-center gap-4">
                    <span>⭐ Note: 4.5/5</span>
                    <span>🚗 {Math.floor(Math.random() * 50) + 10} trajets</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar réservation */}
        <div className="space-y-6">

          {/* Réservation */}
          {isOwner ? (
            <div className="bg-brand-light border border-brand-light rounded-xl p-6">
              <div className="text-center">
                <div className="text-2xl mb-2">🚗</div>
                <h3 className="font-medium mb-1">Votre trajet</h3>
                <p className="text-sm text-brand-dark">
                  Vous êtes le conducteur de ce trajet
                </p>
                <Link
                  to="/dashboard/conducteur/reservations"
                  className="inline-block mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
                >
                  Gérer les réservations
                </Link>
              </div>
            </div>
          ) : !user ? (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-4">Réserver ce trajet</h3>
              <p className="text-gray-600 mb-4">
                Connectez-vous pour réserver ce trajet
              </p>
              <Link
                to="/login"
                className="w-full block text-center py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
              >
                Se connecter
              </Link>
            </div>
          ) : trajet.places_disponibles === 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-2xl mb-2">😞</div>
              <h3 className="font-medium mb-1">Plus de places</h3>
              <p className="text-sm text-red-600">
                Ce trajet est complet
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-4">Réserver ce trajet</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de places
                  </label>
                  <select
                    value={placesAReserver}
                    onChange={(e) => setPlacesAReserver(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                  >
                    {Array.from({ length: Math.min(trajet.places_disponibles, 4) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} place{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span>Prix total:</span>
                    <span className="text-xl font-bold text-brand-dark">
                      {trajet.prix * placesAReserver}€
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleReservation}
                  disabled={reservationLoading}
                  className="w-full bg-brand-dark text-white py-3 rounded-lg hover:bg-brand-verydark disabled:opacity-50 transition font-medium"
                >
                  {reservationLoading ? "Réservation..." : "💺 Réserver maintenant"}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Votre réservation sera en attente de validation du conducteur
                </p>
              </div>
            </div>
          )}

          {/* Contact */}
          {canReserve && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold mb-3">Une question ?</h3>
              <button className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 text-sm">
                💬 Contacter le conducteur
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  </div>
);
}