// frontend/src/pages/dashboard/conducteur/MesTrajets.jsx
import { useEffect, useState } from "react";
import apiFetch from "../../../api/apiClient";
import { Link } from "react-router-dom";

export default function MesTrajets() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/conducteur/mes-trajets");
        // backend: { success: true, data: [...] } or directly array
        const data = res?.data ?? res?.trajets ?? res;
        if (mounted) setTrajets(data || []);
      } catch (err) {
        if (mounted) setError(err.message || "Erreur lors du chargement");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Chargement des trajets…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes trajets publiés</h2>

      {trajets.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Vous n'avez encore publié aucun trajet.</p>
          <Link to="/dashboard/conducteur/nouveau" className="inline-block mt-4 text-sm text-white bg-green-600 px-3 py-2 rounded">
            Publier un trajet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trajets.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{t.depart || t.ville_depart} → {t.arrivee || t.ville_arrivee}</div>
                  <div className="text-sm text-gray-500">Départ : {new Date(t.date_depart).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Places : <span className="font-medium">{t.places_disponibles ?? t.places}</span></div>
                  <div className="text-sm text-gray-500">Prix : <span className="font-medium">{t.prix ?? t.price}</span></div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Link to={`/trajets/details/${t.id}`} className="text-sm px-3 py-1 bg-gray-100 rounded">Voir</Link>
                <Link to={`/dashboard/conducteur/mes-trajets`} className="text-sm px-3 py-1 bg-yellow-100 rounded">Modifier</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
