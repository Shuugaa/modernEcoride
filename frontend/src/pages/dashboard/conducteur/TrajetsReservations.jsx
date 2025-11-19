// frontend/src/pages/dashboard/conducteur/TrajetsReservations.jsx
import { useEffect, useState } from "react";
import apiFetch from "../../../api/apiClient";

export default function TrajetsReservations() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/conducteur/reservations");
        const data = res?.data ?? res?.reservations ?? res;
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

  if (loading) return <p className="p-6 text-gray-500">Chargement des réservations…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Réservations reçues</h2>

      {list.length === 0 ? (
        <p className="text-gray-500">Aucune réservation pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {list.map(r => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.passager_prenom} {r.passager_nom} — {r.places_reservees} place(s)</div>
                  <div className="text-sm text-gray-500">Trajet : {r.ville_depart} → {r.ville_arrivee}</div>
                </div>
                <div className="text-sm text-gray-500">{new Date(r.date).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
