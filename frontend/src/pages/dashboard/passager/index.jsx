// frontend/src/pages/dashboard/passager/index.jsx
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

export default function DashboardPassager() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord — Passager</h1>
      <p className="text-gray-600 mb-6">Bienvenue {user?.prenom}, gérez vos réservations et recherches ici.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/dashboard/passager/en-cours" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Réservation en cours</div>
          <p className="text-sm text-gray-500">Voir votre prochaine course</p>
        </Link>

        <Link to="/recherche" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Rechercher un trajet</div>
          <p className="text-sm text-gray-500">Trouver un trajet rapidement</p>
        </Link>

        <Link to="/dashboard/passager/historique" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Historique</div>
          <p className="text-sm text-gray-500">Trajets passés</p>
        </Link>
      </div>
    </div>
  );
}
