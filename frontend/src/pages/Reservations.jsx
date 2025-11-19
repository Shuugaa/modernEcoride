import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";
import { useUser } from "../context/UserContext";

export default function Reservations() {
  const { user, setUser } = useUser();
  const [trajetDetails, setTrajetDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { trajetId } = useParams();

  useEffect(() => {
    const fetchTrajetDetails = async () => {
      try {
        const response = await apiFetch(`/trajets/details/${trajetId}`);

        if (response.success) {
          setTrajetDetails(response.trajet);
        } else {
          setError(response.message || "Erreur lors de la récupération du trajet.");
        }
      } catch (err) {
        setError("Erreur réseau.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrajetDetails();
  }, [trajetId]);

  const handleReserve = async () => {
    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`/reservation/add/${trajetDetails.id}`, {
        method: "POST",
        body: JSON.stringify({
          places_reservees: 1,
          prix: trajetDetails.prix,
        }),
      });

      // Débit déjà fait côté backend
      if (response?.success) {
        // Mise à jour locale du user avec les crédits renvoyés
        if (response.credits !== undefined) {
          setUser({ ...user, credits: response.credits });
        }

        setMessage("Trajet réservé avec succès !");
        const refreshedTrajet = await apiFetch(`/trajets/details/${trajetDetails.id}`);
        if (refreshedTrajet.success) {
          setTrajetDetails(refreshedTrajet.trajet);
        }
      } else {
        setError(response.message || "Erreur lors de la réservation.");
      }
    } catch (err) {
      setError("Erreur réseau lors de la réservation.");
    }
  };

  if (loading) return <p>Chargement du trajet...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!trajetDetails) return <p>Trajet non trouvé.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Détails du Trajet</h1>

      <p><strong>Départ :</strong> {trajetDetails.depart}</p>
      <p><strong>Arrivée :</strong> {trajetDetails.arrivee}</p>
      <p><strong>Date :</strong> {new Date(trajetDetails.date_depart).toLocaleDateString()}</p>
      <p><strong>Places disponibles :</strong> {trajetDetails.places_disponibles}</p>
      <p><strong>Prix :</strong> {trajetDetails.prix} crédits</p>

      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleReserve}
      >
        Réserver ce trajet
      </button>

      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
