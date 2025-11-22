import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function MesTrajets() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadTrajets();
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await apiFetch("/conducteur/reservations");

      if (data.success) {
        setReservations(data.reservations || []);
      }
    } catch (err) {
      console.error("Erreur réservations:", err);
    }
  };

  const gererReservation = async (reservationId, action) => {
    try {
      const data = await apiFetch(`/conducteur/reservations/${reservationId}/statut`, {
        method: "PUT",
        body: JSON.stringify({ statut: action === 'accepter' ? 'confirmee' : 'refusee' })
      });

      if (data.success) {
        loadReservations(); // Recharger
        loadTrajets(); // Recharger aussi les trajets pour les places
        alert(action === 'accepter' ? 'Réservation acceptée !' : 'Réservation refusée !');
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      console.error("Erreur gestion réservation:", err);
      alert("Erreur lors de la gestion de la réservation");
    }
  };

  const loadTrajets = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/conducteur/mes-trajets");

      if (data.success) {
        setTrajets(data.trajets || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Erreur trajets:", err);
      setError("Impossible de charger les trajets");
    } finally {
      setLoading(false);
    }
  };

  const changerStatutTrajet = async (trajetId, statut) => {
    try {
      const data = await apiFetch(`/conducteur/trajets/${trajetId}/statut`, {
        method: "PUT",
        body: JSON.stringify({ statut })
      });

      if (data.success) {
        loadTrajets(); // Recharger
        loadReservations(); // Recharger les réservations

        // Message personnalisé selon le statut
        if (statut === 'termine') {
          alert(`🎉 ${data.message}`); // Affiche le montant gagné
        } else {
          alert(`Trajet ${statut} !`);
        }
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      console.error("Erreur statut:", err);
      alert("Erreur lors du changement de statut");
    }
  };

  const supprimerTrajet = async (trajetId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) return;

    try {
      const data = await apiFetch(`/conducteur/trajets/${trajetId}`, {
        method: "DELETE"
      });

      if (data.success) {
        loadTrajets();
        alert("Trajet supprimé !");
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate2 = (dateString) => {
    const [date, time] = dateString.split("T");
    return `${date.split("-").reverse().join("/")} à ${time.slice(0,5)}`;
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">🔄 Chargement de vos trajets...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button
            onClick={loadTrajets}
            className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes Trajets</h2>
          <p className="text-gray-600">Gérez et modifiez vos trajets publiés</p>
        </div>
        <a
          href="/dashboard/conducteur/nouveau"
          className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
        >
          ➕ Nouveau trajet
        </a>
      </div>

      {reservations.filter(r => r.statut === 'en_attente').length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-orange-600">
            🔔 Réservations en attente ({reservations.filter(r => r.statut === 'en_attente').length})
          </h3>

          <div className="space-y-3">
            {reservations.filter(r => r.statut === 'en_attente').map(reservation => (
              <div key={reservation.id} className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {reservation.prenom} {reservation.nom} veut réserver
                    </p>
                    <p className="text-sm text-gray-600">
                      📧 {reservation.email} •
                      👥 {reservation.places} place(s) •
                      💰 {reservation.prix_total}€
                    </p>
                    <p className="text-sm text-gray-500">
                      Trajet : {reservation.depart} → {reservation.arrivee}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => gererReservation(reservation.id, 'accepter')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      ✅ Accepter
                    </button>
                    <button
                      onClick={() => gererReservation(reservation.id, 'refuser')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des trajets */}
      {trajets.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun trajet créé</h3>
          <p className="text-gray-600 mb-4">Commencez par créer votre premier trajet !</p>
          <a
            href="/dashboard/conducteur/nouveau"
            className="inline-block px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
          >
            Créer un trajet
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {trajets.map(trajet => (
            <div key={trajet.id} className="bg-white rounded-xl shadow overflow-hidden">

              {/* Header du trajet */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {trajet.depart} → {trajet.arrivee}
                    </h3>
                    <p className="text-gray-600">
                      📅 {formatDate2(trajet.date_depart)} •
                      💰 {trajet.prix}€/place •
                      👥 {trajet.places_disponibles}/{trajet.places_total} places
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(trajet.statut)}`}>
                    {trajet.statut}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="flex justify-between items-center">

                  {/* Réservations confirmées pour ce trajet */}
                  {reservations.filter(r => r.trajet_id === trajet.id && r.statut === 'confirmee').length > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Passagers confirmés :</h4>
                      {reservations.filter(r => r.trajet_id === trajet.id && r.statut === 'confirmee').map(res => (
                        <div key={res.id} className="text-sm text-green-700">
                          • {res.prenom} {res.nom} ({res.places} place(s))
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="flex-1">
                    {trajet.description && (
                      <p className="text-gray-700 mb-2">{trajet.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Créé le {formatDate(trajet.created_at)}
                    </p>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-2 ml-4">

                    {trajet.statut === 'actif' && (
                      <>
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'en_cours')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          🚀 Démarrer
                        </button>
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'annule')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          ❌ Annuler
                        </button>
                      </>
                    )}

                    {trajet.statut === 'en_cours' && (
                      <>
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'termine')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          ✅ Terminer
                        </button>
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'annule')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          ❌ Annuler
                        </button>
                      </>
                    )}

                    {['termine', 'annule'].includes(trajet.statut) && (
                      <button
                        onClick={() => supprimerTrajet(trajet.id)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        🗑️ Supprimer
                      </button>
                    )}

                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}