// frontend/src/pages/dashboard/conducteur/index.jsx
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

export default function DashboardConducteur() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord — Conducteur</h1>
      <p className="text-gray-600 mb-6">Bonjour {user?.prenom}, gérez vos trajets et vos réservations ici.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/conducteur/nouveau"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">Créer un nouveau trajet</div>
          <p className="text-sm text-gray-500 mt-1">Publiez un trajet rapidement.</p>
        </Link>

        <Link
          to="/dashboard/conducteur/mes-trajets"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">Mes trajets</div>
          <p className="text-sm text-gray-500 mt-1">Consultez et gérez vos trajets publiés.</p>
        </Link>

        <Link
          to="/dashboard/conducteur/reservations"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">Réservations reçues</div>
          <p className="text-sm text-gray-500 mt-1">Voir les réservations effectuées sur vos trajets.</p>
        </Link>
      </div>
    </div>
  );
}
