import { useUser } from "../context/UserContext";
import { apiFetch } from "../api/apiClient";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function TrajetsList() {
    const { user } = useUser();
    const [trajets, setTrajets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrajets() {
            try {
                const data = await apiFetch("/trajets/all/:userId".replace(":userId", user.id));
                if (data.success) {
                    setTrajets(data.trajets);
                } else {
                    console.error("Erreur lors du chargement des trajets:", data.message);
                }
            } catch (error) {
                console.error("Erreur réseau lors du chargement des trajets:", error);
            }
            setLoading(false);
        }
        fetchTrajets();
    }, []);

    return (
        <div>
            <h1 className="text-xl font-semibold text-brand-dark mb-3">Liste des trajets de {user.prenom}</h1>
            {loading ? (
                <p>Chargement des trajets...</p>
            ) : trajets.length === 0 ? (
                <p>Aucun trajet disponible.</p>
            ) : (
                <ul className="list-disc list-inside">
                    {trajets.map((trajet) => (
                        <li key={trajet.id}>
                            {trajet.depart} à {trajet.arrivee} le {new Date(trajet.date_depart).toLocaleDateString()} pour {trajet.prix} €.
                            Places disponibles: {trajet.places_disponibles}
                            <br />
                            <Link to={`/trajets/details/${trajet.id}`} className="hover:text-green-200">
                                Voir détails
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};