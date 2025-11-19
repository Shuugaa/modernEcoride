// frontend/src/pages/dashboard/passager/HistoriqueTrajets.jsx
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
        const data = res?.data ?? res?.historique ?? res;
        if (mounted) setList(data || []);
      } catch (err) {
        if (mounted) setError(err.message || "Erreur");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Chargement de l'historique…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Historique des trajets</h2>

      {list.length === 0 ? (
        <p className="text-gray-500">Vous n'avez pas d'historique.</p>
      ) : (
        <div className="space-y-4">
          {list.map(h => (
            <div key={h.id} className="bg-white p-4 rounded shadow">
              <div className="font-semibold">{h.ville_depart} → {h.ville_arrivee}</div>
              <div className="text-sm text-gray-500">Le {new Date(h.date).toLocaleString()}</div>
              <div className="text-sm">Conducteur : {h.conducteur_prenom} {h.conducteur_nom}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
