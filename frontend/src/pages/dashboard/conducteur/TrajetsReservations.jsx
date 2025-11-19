// REMPLACE TOUT le contenu par le code de GestionReservations que j'ai donné
import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function TrajetsReservations() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrajetsAvecReservations();
  }, []);

  const loadTrajetsAvecReservations = async () => {
    try {
      const data = await apiFetch("/conducteur/trajets-reservations");
      if (data.success) {
        setTrajets(data.trajets || []);
      }
    } catch (err) {
      console.error("Erreur trajets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (reservationId, action) => {
    try {
      const data = await apiFetch(`/conducteur/reservations/${reservationId}/${action}`, {
        method: "POST"
      });

      if (data.success) {
        loadTrajetsAvecReservations(); // Recharger
        alert(`Réservation ${action === 'accept' ? 'acceptée' : 'refusée'} !`);
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      alert("Erreur lors de l'action");
    }
  };

  const changerStatutTrajet = async (trajetId, statut) => {
    try {
      const data = await apiFetch(`/conducteur/trajets/${trajetId}/statut`, {
        method: "PUT",
        body: JSON.stringify({ statut })
      });

      if (data.success) {
        loadTrajetsAvecReservations();
        alert(`Trajet ${statut} !`);
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      alert("Erreur lors du changement de statut");
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getReservationColor = (statut) => {
    switch (statut) {
      case 'confirmee': return 'bg-green-100 text-green-800';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'refusee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">🔄 Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mes Trajets & Réservations</h2>
        <p className="text-gray-600">Gérez vos trajets et validez les réservations</p>
      </div>

      {/* Trajets */}
      <div className="space-y-6">
        {trajets.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun trajet</h3>
            <p className="text-gray-600">Vous n'avez pas encore créé de trajet.</p>
          </div>
        ) : (
          trajets.map(trajet => (
            <div key={trajet.id} className="bg-white rounded-xl shadow overflow-hidden">
              
              {/* Header du trajet */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {trajet.depart} → {trajet.arrivee}
                    </h3>
                    <p className="text-gray-600">
                      📅 {formatDate(trajet.date_depart)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(trajet.statut)}`}>
                      {trajet.statut}
                    </span>
                    <div className="flex gap-2">
                      {trajet.statut === 'actif' && (
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'en_cours')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          🚀 Démarrer
                        </button>
                      )}
                      {trajet.statut === 'en_cours' && (
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'termine')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          ✅ Terminer
                        </button>
                      )}
                      {['actif', 'en_cours'].includes(trajet.statut) && (
                        <button
                          onClick={() => changerStatutTrajet(trajet.id, 'annule')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          ❌ Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Réservations */}
              <div className="p-6">
                <h4 className="font-medium mb-4">
                  Réservations ({trajet.reservations?.length || 0})
                </h4>
                
                {!trajet.reservations || trajet.reservations.length === 0 ? (
                  <p className="text-gray-500 italic">Aucune réservation pour ce trajet</p>
                ) : (
                  <div className="space-y-3">
                    {trajet.reservations.map(reservation => (
                      <div 
                        key={reservation.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {reservation.passager_prenom} {reservation.passager_nom}
                          </div>
                          <div className="text-sm text-gray-600">
                            📧 {reservation.passager_email} • 
                            👥 {reservation.places} place{reservation.places > 1 ? 's' : ''} • 
                            💰 {reservation.prix_total}€
                          </div>
                          <div className="text-xs text-gray-500">
                            Demandé le {formatDate(reservation.date_reservation)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReservationColor(reservation.statut)}`}>
                            {reservation.statut}
                          </span>
                          
                          {reservation.statut === 'en_attente' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleReservation(reservation.id, 'accept')}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                ✅ Accepter
                              </button>
                              <button
                                onClick={() => handleReservation(reservation.id, 'refuse')}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                ❌ Refuser
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}