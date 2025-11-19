// src/pages/dashboard/modules/EmployeModule.jsx
import { Link } from "react-router-dom";

export default function EmployeModule() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🏢 Tableau de bord — Employé</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Link
          to="/employe/monitoring"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">📊 Monitoring</h2>
          <p>Statistiques, trajets actifs, activité en temps réel.</p>
        </Link>

        <Link
          to="/employe/support"
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold mb-2">💬 Support</h2>
          <p>Accédez aux demandes des utilisateurs.</p>
        </Link>

      </div>
    </div>
  );
}
