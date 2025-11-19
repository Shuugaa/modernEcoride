import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function TrajetsDetails() {
  const { id } = useParams();
  const [trajet, setTrajet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrajetDetails = async () => {
      try {
        const response = await apiFetch(`/trajets/details/${id}`, {
          method: 'GET',
        });
        if (response.success) {
          setTrajet(response.trajet);
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
  }, [id]);

  if (loading) return <p>Chargement du trajet...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!trajet) return <p>Trajet non trouvé.</p>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4 text-brand-dark">Détails du Trajet</h1>
      <p><strong>Départ :</strong> {trajet.depart}</p>
      <p><strong>Arrivée :</strong> {trajet.arrivee}</p>
      <p><strong>Date de départ :</strong> {new Date(trajet.date_depart).toLocaleDateString()}</p>
      <p><strong>Places disponibles :</strong> {trajet.places_disponibles}</p>
      <p><strong>Prix :</strong> {trajet.prix} Crédits</p>
    </div>
  );
}