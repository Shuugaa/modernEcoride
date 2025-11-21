import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../api/apiClient';

const MesVehicules = () => {
  const [vehicules, setVehicules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicules();
  }, []);

  const loadVehicules = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/vehicules');
      if (response.success) {
        setVehicules(response.vehicules || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehiculeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/vehicules/${vehiculeId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setVehicules(vehicules.filter(v => v.id !== vehiculeId));
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erreur: {error}</p>
          <button 
            onClick={loadVehicules}
            className="mt-2 text-red-600 hover:text-red-800 underline"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚗 Mes Véhicules
          </h1>
          <p className="text-gray-600">
            Gérez votre flotte de véhicules pour vos trajets
          </p>
        </div>
        <Link
          to="/dashboard/conducteur/vehicules/nouveau"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Ajouter un véhicule
        </Link>
      </div>

      {/* Liste des véhicules */}
      {vehicules.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun véhicule enregistré
          </h3>
          <p className="text-gray-500 mb-6">
            Ajoutez votre premier véhicule pour commencer à proposer des trajets
          </p>
          <Link
            to="/dashboard/conducteur/vehicules/nouveau"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            Ajouter mon premier véhicule
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {vehicules.map(vehicule => (
            <div key={vehicule.id} className="bg-white rounded-xl shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {vehicule.marque} {vehicule.modele}
                        </h3>
                        <p className="text-gray-600 font-mono">
                          {vehicule.immatriculation}
                        </p>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👥 Places :</span>
                        <span className="font-medium">{vehicule.places} personnes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅 Ajouté le :</span>
                        <span className="font-medium">
                          {new Date(vehicule.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/dashboard/conducteur/vehicules/${vehicule.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicule.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Stats utilisation (optionnel) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Trajets réalisés avec ce véhicule</span>
                    <span className="font-medium">
                      {vehicule.trajets_count || 0} trajets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesVehicules;