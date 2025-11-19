// src/pages/dashboard/modules/AdminModule.jsx
import { Link } from "react-router-dom";

export default function AdminModule() {
  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-semibold mb-2">Espace Administrateur</h2>
      <p className="text-gray-600 mb-4">
        Supervisez l’ensemble du système : utilisateurs, paiements, trajets, logs.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Link
          to="/admin/users"
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center"
        >
          Gestion des utilisateurs 👥
        </Link>

        <Link
          to="/admin/trajets"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-center"
        >
          Gestion des trajets 🚗
        </Link>

        <Link
          to="/admin/credits"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-center"
        >
          Gestion des crédits 💳
        </Link>

        <Link
          to="/admin/logs"
          className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg text-center"
        >
          Logs & Sécurité 🔐
        </Link>

      </div>
    </section>
  );
}
