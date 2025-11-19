import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function AdminTrajets() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, completed, cancelled

  useEffect(() => {
    loadTrajets();
  }, [filter]);

  const loadTrajets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      
      const data = await apiFetch(`/admin/trajets?${params}`);
      
      if (data.success) {
        setTrajets(data.trajets || []);
      } else {
        setError(data.message || "Erreur lors du chargement");
      }
    } catch (err) {
      console.error("Erreur trajets admin:", err);
      setError("Impossible de charger les trajets");
    } finally {
      setLoading(false);
    }
  };

  const updateTrajetStatus = async (trajetId, newStatus) => {
    try {
      const data = await apiFetch(`/admin/trajets/${trajetId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });

      if (data.success) {
        loadTrajets(); // Recharger la liste
        alert(`Trajet ${newStatus} avec succès`);
      } else {
        alert(data.message || "Erreur lors de la modification");
      }
    } catch (err) {
      console.error("Erreur modification trajet:", err);
      alert("Erreur lors de la modification");
    }
  };

  const deleteTrajet = async (trajetId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce trajet ?")) return;

    try {
      const data = await apiFetch(`/admin/trajets/${trajetId}`, {
        method: "DELETE"
      });

      if (data.success) {
        loadTrajets();
        alert("Trajet supprimé avec succès");
      } else {
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur suppression trajet:", err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'actif': return 'Actif';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Supervision des Trajets</h2>
          <p className="text-gray-600">Gérer et modérer tous les trajets de la plateforme</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "all" 
                ? "bg-brand-dark text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tous ({trajets.length})
          </button>
          
          <button
            onClick={() => setFilter("actif")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "actif" 
                ? "bg-green-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Actifs
          </button>
          
          <button
            onClick={() => setFilter("termine")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "termine" 
                ? "bg-gray-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Terminés
          </button>
          
          <button
            onClick={() => setFilter("annule")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === "annule" 
                ? "bg-red-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Annulés
          </button>
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-lg text-gray-600">🔄 Chargement des trajets...</div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button 
            onClick={loadTrajets}
            className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark"
          >
            Réessayer
          </button>
        </div>
      ) : trajets.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun trajet</h3>
          <p className="text-gray-600">
            {filter === "all" ? "Aucun trajet trouvé" : `Aucun trajet ${filter}`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          
          {/* Table header */}
          <div className="bg-gray-50 px-6 py-3 border-b">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-3">Trajet</div>
              <div className="col-span-2">Conducteur</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Places</div>
              <div className="col-span-1">Prix</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Table body */}
          <div className="divide-y">
            {trajets.map(trajet => (
              <div key={trajet.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center text-sm">
                  
                  {/* Trajet */}
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">
                      {trajet.depart} → {trajet.arrivee}
                    </div>
                    <div className="text-gray-500 text-xs">
                      ID: {trajet.id}
                    </div>
                  </div>

                  {/* Conducteur */}
                  <div className="col-span-2">
                    <div className="text-gray-900">
                      {trajet.conducteur_prenom} {trajet.conducteur_nom}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {trajet.conducteur_email}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <div className="text-gray-900">
                      {formatDate(trajet.date_depart)}
                    </div>
                  </div>

                  {/* Places */}
                  <div className="col-span-1">
                    <span className="text-gray-900">
                      {trajet.places_disponibles}/{trajet.places_total}
                    </span>
                  </div>

                  {/* Prix */}
                  <div className="col-span-1">
                    <span className="font-medium text-brand-dark">
                      {trajet.prix}€
                    </span>
                  </div>

                  {/* Statut */}
                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trajet.statut)}`}>
                      {getStatusLabel(trajet.statut)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2">
                    <div className="flex gap-1">
                      
                      {trajet.statut === 'actif' && (
                        <>
                          <button
                            onClick={() => updateTrajetStatus(trajet.id, 'annule')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => updateTrajetStatus(trajet.id, 'termine')}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Terminer
                          </button>
                        </>
                      )}

                      {trajet.statut === 'annule' && (
                        <button
                          onClick={() => updateTrajetStatus(trajet.id, 'actif')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Réactiver
                        </button>
                      )}

                      <button
                        onClick={() => deleteTrajet(trajet.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Suppr
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}