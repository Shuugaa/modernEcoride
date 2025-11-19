import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../api/apiClient";

export default function ReservationsEnCours() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => load(), []);

  async function load() {
    setLoading(true);
    const res = await apiFetch("/passager/reservations");
    if (res.success) setReservations(res.data);
    setLoading(false);
  }

  async function annulerReservation(id) {
    if (!confirm("Annuler cette réservation ?")) return;

    const res = await apiFetch(`/passager/reservations/${id}`, {
      method: "DELETE",
    });

    if (res.success) {
      setReservations((prev) => prev.filter(r => r.id !== id));
    } else {
      alert(res.message);
    }
  }

  if (loading) return <p>Chargement...</p>;

  if (reservations.length === 0)
    return <p className="text-gray-500">Aucune réservation en cours.</p>;

  return (
    <div className="space-y-4">
      {reservations.map(r => (
        <div key={r.id} className="p-4 bg-white shadow border rounded">
          <p className="font-semibold">{r.depart} → {r.arrivee}</p>
          <p className="text-gray-600">
            Départ : {new Date(r.date_depart).toLocaleString()}
          </p>
          <p>Places : <strong>{r.places}</strong></p>
          <p>Montant : <strong>{r.montant} crédits</strong></p>

          <div className="mt-3 flex gap-3">
            <Link
              to={`/trajets/details/${r.trajet_id}`}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Détails
            </Link>

            <button
              onClick={() => annulerReservation(r.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
