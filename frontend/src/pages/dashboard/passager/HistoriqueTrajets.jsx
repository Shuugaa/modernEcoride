import { useEffect, useState } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function HistoriqueTrajets() {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => load(), []);

  async function load() {
    setLoading(true);
    const res = await apiFetch("/passager/historique");

    if (res.success) setHistorique(res.data);

    setLoading(false);
  }

  if (loading) return <p>Chargement...</p>;

  if (historique.length === 0)
    return <p className="text-gray-500">Aucun trajet effectué pour le moment.</p>;

  return (
    <div className="space-y-3">
      {historique.map(h => (
        <div key={h.id} className="p-3 bg-gray-100 rounded border">
          <p className="font-semibold">{h.depart} → {h.arrivee}</p>
          <p className="text-gray-600">
            Fait le : {new Date(h.date_depart).toLocaleDateString()}
          </p>
          <p className="text-sm">Places : {h.places}</p>
        </div>
      ))}
    </div>
  );
}
