// src/pages/dashboard/passager/RechercheShortcut.jsx
import { Link } from "react-router-dom";

export default function RechercheShortcut() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Rechercher un trajet</h2>

      <p className="mb-4 text-gray-600">
        Cliquez ci-dessous pour accéder à la recherche :
      </p>

      <Link
        to="/recherche"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
      >
        🔍 Rechercher un trajet
      </Link>
    </div>
  );
}
