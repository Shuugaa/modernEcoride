import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../../api/apiClient";

export default function TrajetReservations() {
  const { trajetId } = useParams();
  const [trajet, setTrajet] = useState(null);
  const [passagers, setPassagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const res = await apiFetch(`/conducteur/trajets/${trajetId}/reservations`);

    if (res.success) {
      setTrajet(res.trajet);
      setPassagers(res.passagers);
    } else {
      alert(res.message);
    }

    setLoading(false);
  }

  async function retirerPassager(reservationId) {
    if (!confirm("Retirer ce passager du trajet ?")) return;

    const res = await apiFetch(`/conducteur/reservations/${reservationId}`, {
      method: "DELETE",
    });

    if (res.success) {
      setPassagers((prev) => prev.filter((p) => p.reservation_id !== reservationId));
    } else {
      alert(res.message);
    }
  }

  if (loading) return <p>Chargement...</p>;

  if (!trajet) return <p>Trajet introuvable.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Passagers inscrits – {trajet.depart} → {trajet.arrivee}
      </h1>

      <p className="text-gray-600 mb-4">
        Date : {new Date(trajet.date_depart).toLocaleString()}
      </p>

      <Link
        to="/dashboard/conducteur/trajets"
        className="px-3 py-2 bg-gray-300 rounded shadow hover:bg-gray-400"
      >
        ← Retour
      </Link>

      {/* Liste vide */}
      {passagers.length === 0 && (
        <p className="text-gray-500 mt-6">Aucun passager pour ce trajet.</p>
      )}

      {/* Liste des passagers */}
      <div className="mt-6 space-y-4">
        {passagers.map((p) => (
          <div key={p.reservation_id} className="p-4 bg-white rounded shadow border">
            <p className="font-bold">{p.nom} {p.prenom}</p>
            <p className="text-gray-600">{p.email}</p>
            <p className="mt-1">
              Places réservées : <strong>{p.places_reservees}</strong>
            </p>
            <p>
              Crédit payé : <strong>{p.montant_total}</strong>
            </p>

            <button
              onClick={() => retirerPassager(p.reservation_id)}
              className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Retirer le passager
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
