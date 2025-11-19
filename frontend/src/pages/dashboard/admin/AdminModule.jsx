// frontend/src/pages/dashboard/modules/AdminModule.jsx
import { Link } from "react-router-dom";

export default function AdminModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Administration</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/users" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Utilisateurs</div>
          <div className="text-sm text-gray-500 mt-1">Gérer les comptes & rôles</div>
        </Link>

        <Link to="/admin/trajets" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Trajets</div>
          <div className="text-sm text-gray-500 mt-1">Superviser l'activité</div>
        </Link>

        <Link to="/admin/stats" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Statistiques</div>
          <div className="text-sm text-gray-500 mt-1">Vue globale</div>
        </Link>
      </div>
    </div>
  );
}
