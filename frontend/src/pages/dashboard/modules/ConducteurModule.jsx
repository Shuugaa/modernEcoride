// frontend/src/pages/dashboard/modules/ConducteurModule.jsx
import { Link } from "react-router-dom";

export default function ConducteurModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Espace Conducteur</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/dashboard/conducteur/mes-trajets" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Mes trajets</div>
          <div className="text-sm text-gray-500 mt-1">Gérer et modifier vos trajets</div>
        </Link>

        <Link to="/dashboard/conducteur/nouveau" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Créer un trajet</div>
          <div className="text-sm text-gray-500 mt-1">Publier un nouveau trajet</div>
        </Link>

        <Link to="/dashboard/conducteur/reservations" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Réservations</div>
          <div className="text-sm text-gray-500 mt-1">Voir les réservations reçues</div>
        </Link>
      </div>
    </div>
  );
}
