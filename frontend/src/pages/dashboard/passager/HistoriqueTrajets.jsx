import { useEffect, useState } from "react";
import apiFetch from "../../../api/apiClient";

export default function HistoriqueTrajets() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/passager/historique");
        const data = res?.historique || res?.data || [];
        if (mounted) setList(data);
      } catch (err) {
        if (mounted) setError(err.message || "Erreur de chargement");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Chargement de l'historique…</p>;
  if (error) return <p className="p-6 text-red-500">Erreur : {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📚 Historique des trajets</h2>

      {list.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🚗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet effectué</h3>
          <p className="text-gray-500">Vos trajets terminés apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map(h => (
            <div key={h.id} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow">
              {/* En-tête */}
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-lg text-gray-900">
                  {h.depart} → {h.arrivee}
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Terminé
                </span>
              </div>

              {/* Détails */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">📅 Date :</span>
                  <div className="font-medium">
                    {new Date(h.date_depart).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(h.date_depart).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">👤 Conducteur :</span>
                  <div className="font-medium">
                    {h.conducteur_prenom} {h.conducteur_nom}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">👥 Places :</span>
                  <div className="font-medium">{h.places} place(s)</div>
                </div>
                
                <div>
                  <span className="text-gray-500">💰 Prix :</span>
                  <div className="font-medium text-green-600">{h.prix_total}€</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}