import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { apiFetch } from "../../../api/apiClient";

export default function PassagerIndex() {
  const { user } = useUser();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-brand-dark to-brand-verydark text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">
          Bonjour {user?.prenom} ! 👋
        </h2>
        <p className="opacity-90">
          Prêt à voyager ? Trouvez votre prochain trajet !
        </p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rechercher un trajet */}
        <Link 
          to="/recherche"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group"
        >
          <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Rechercher un trajet</h3>
          <p className="text-sm text-gray-600">
            Trouvez un covoiturage pour votre destination
          </p>
        </Link>

        {/* Réservations en cours */}
        <Link 
          to="/dashboard/passager/en-cours"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Réservations en cours</h3>
          <p className="text-sm text-gray-600">
            Voir vos prochains trajets
          </p>
        </Link>

        {/* Historique */}
        <Link 
          to="/dashboard/passager/historique"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Historique</h3>
          <p className="text-sm text-gray-600">
            Vos trajets précédents
          </p>
        </Link>
      </div>

      {/* Aperçu réservations en cours */}
      <ReservationsEnCours />

    </div>
  );
}

// Composant pour afficher les réservations en cours
function ReservationsEnCours() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const data = await apiFetch("/passager/en-cours");
        if (data.success) {
          setReservations(data.reservations_en_cours || []);
        }
      } catch (err) {
        console.error("Erreur réservations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Vos prochains trajets</h3>
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Vos prochains trajets</h3>
        <p className="text-gray-500">Aucun trajet prévu pour le moment.</p>
        <Link 
          to="/recherche" 
          className="inline-flex items-center mt-3 text-brand-dark hover:text-brand-verydark text-sm"
        >
          Rechercher un trajet →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Vos prochains trajets</h3>
      <div className="space-y-3">
        {reservations.slice(0, 2).map(reservation => (
          <div 
            key={reservation.id} 
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium">
                {reservation.depart} → {reservation.arrivee}
              </div>
              <div className="text-sm text-gray-600">
                {new Date(reservation.date_depart).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className={`inline-flex px-2 py-1 text-xs rounded-full ${
              reservation.status === 'confirmee' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {reservation.status === 'confirmee' ? 'Confirmé' : 'En attente'}
            </div>
          </div>
        ))}
        
        {reservations.length > 2 && (
          <Link 
            to="/dashboard/passager/en-cours"
            className="block text-center text-brand-dark hover:text-brand-verydark text-sm mt-3"
          >
            Voir tous mes trajets
          </Link>
        )}
      </div>
    </div>
  );
}