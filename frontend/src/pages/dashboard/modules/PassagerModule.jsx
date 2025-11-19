// frontend/src/pages/dashboard/modules/PassagerModule.jsx
import { Link } from "react-router-dom";

export default function PassagerModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Espace Passager</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/recherche" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Rechercher un trajet</div>
          <div className="text-sm text-gray-500 mt-1">Trouver un conducteur</div>
        </Link>

        <Link to="/reservations/mine" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Mes réservations</div>
          <div className="text-sm text-gray-500 mt-1">Consulter vos réservations</div>
        </Link>

        <Link to="/dashboard/passager/historique" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Historique</div>
          <div className="text-sm text-gray-500 mt-1">Trajets passés</div>
        </Link>
      </div>
    </div>
  );
}
