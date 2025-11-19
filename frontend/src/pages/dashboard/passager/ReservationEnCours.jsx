// frontend/src/pages/dashboard/passager/ReservationEnCours.jsx
import { useEffect, useState } from "react";
import apiFetch from "../../../api/apiClient";

export default function ReservationEnCours() {
  const [resv, setResv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch("/passager/en-cours");

        if (response.success) {
          // Prendre la première réservation ou toutes
          const reservations = response.reservations_en_cours || [];
          if (mounted) setResv(reservations[0] || null); // Première réservation
        } else {
          if (mounted) setError(response.message || "Erreur");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Erreur");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Chargement…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!resv) return <p className="p-6 text-gray-500">Aucune réservation en cours.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Réservation en cours</h2>

      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold">{resv.ville_depart} → {resv.ville_arrivee}</div>
        <div className="text-sm text-gray-500">Le {new Date(resv.date).toLocaleString()}</div>
        <div className="mt-2">Conducteur : {resv.conducteur_prenom} {resv.conducteur_nom}</div>
      </div>
    </div>
  );
}
