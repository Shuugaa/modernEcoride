// src/pages/dashboard/modules/EmployeModule.jsx
import { Link } from "react-router-dom";

export default function EmployeModule() {
  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-semibold mb-2">Espace Employé</h2>
      <p className="text-gray-600 mb-4">
        Outils internes pour la vérification, le support et la gestion des
        utilisateurs.
      </p>

      <div className="flex flex-col gap-3">

        <Link
          to="/staff/support"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Support & Tickets 🎧
        </Link>

        <Link
          to="/staff/users"
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg"
        >
          Gestion des utilisateurs 👥
        </Link>

        <Link
          to="/staff/trajets"
          className="px-4 py-2 bg-indigo-400 hover:bg-indigo-500 text-white rounded-lg"
        >
          Vérification des trajets 📝
        </Link>
      </div>
    </section>
  );
}
