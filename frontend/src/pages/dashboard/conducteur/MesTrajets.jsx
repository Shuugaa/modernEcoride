import { useEffect, useState } from "react";
import { apiFetch } from "../../../api/apiClient";
import { Link } from "react-router-dom";

export default function MesTrajets() {
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrajets();
  }, []);

  async function loadTrajets() {
    setLoading(true);
    const res = await apiFetch("/conducteur/trajets");
    if (res.success) setTrajets(res.trajets);
    setLoading(false);
  }

  async function supprimerTrajet(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce trajet ?")) return;

    const res = await apiFetch(`/conducteur/trajets/${id}`, {
      method: "DELETE",
    });

    if (res.success) {
      setTrajets((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert(res.message);
    }
  }

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Mes trajets 🚗</h1>

      <div className="mt-6">
        <Link
          to="/dashboard/conducteur/nouveau"
          className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
        >
          ➕ Publier un trajet
        </Link>
      </div>

      {/* Aucun trajet */}
      {trajets.length === 0 && (
        <p className="text-gray-500 mt-6">Vous n'avez encore publié aucun trajet.</p>
      )}

      {/* Liste */}
      <div className="mt-6 space-y-4">
        {trajets.map((t) => (
          <div key={t.id} className="p-4 bg-white rounded shadow border">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">
                  {t.depart} → {t.arrivee}
                </p>
                <p className="text-gray-600">
                  {new Date(t.date_depart).toLocaleString()}
                </p>
                <p>
                  <strong>{t.places_disponibles}</strong> places restantes —{" "}
                  <strong>{t.prix}</strong> crédits / personne
                </p>
              </div>

              <div className="flex flex-col gap-2">

                <Link
                  to={`/trajets/details/${t.id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Voir détails
                </Link>

                <Link
                  to={`/dashboard/conducteur/reservations/${t.id}`}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                >
                  Passagers ({t.reservations_count})
                </Link>

                <button
                  onClick={() => supprimerTrajet(t.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Supprimer
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
