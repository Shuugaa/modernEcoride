// src/pages/dashboard/modules/AdminModule.jsx
import { Link } from "react-router-dom";

export default function AdminModule() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🛠️ Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Link
          to="/admin/users"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">👥 Gestion des utilisateurs</h2>
          <p>Rôles, permissions, bannissements, etc.</p>
        </Link>

        <Link
          to="/admin/trajets"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">🚗 Trajets</h2>
          <p>Supervision complète des trajets déclarés.</p>
        </Link>

        <Link
          to="/admin/statistiques"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">📈 Statistiques</h2>
          <p>Vue globale de l’activité.</p>
        </Link>

      </div>
    </div>
  );
}
