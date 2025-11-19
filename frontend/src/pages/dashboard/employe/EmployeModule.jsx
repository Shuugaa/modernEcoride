// frontend/src/pages/dashboard/modules/EmployeModule.jsx
import { Link } from "react-router-dom";

export default function EmployeModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Espace Employé</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/employe/monitoring" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Monitoring</div>
          <div className="text-sm text-gray-500 mt-1">Statistiques & supervision</div>
        </Link>

        <Link to="/employe/support" className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
          <div className="font-semibold">Support</div>
          <div className="text-sm text-gray-500 mt-1">Traitement des demandes</div>
        </Link>
      </div>
    </div>
  );
}
