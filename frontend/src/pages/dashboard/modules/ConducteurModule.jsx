// src/pages/dashboard/modules/ConducteurModule.jsx
import { Link } from "react-router-dom";

export default function ConducteurModule() {
  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-semibold mb-2">Espace Conducteur</h2>
      <p className="text-gray-600 mb-4">
        Gérez vos trajets et suivez vos réservations passagers.
      </p>

      <div className="flex gap-3">
        <Link
          to="/trajets"
          className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg"
        >
          Gérer mes trajets 🚗
        </Link>

        <Link
          to="/trajets/nouveau"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Proposer un trajet ➕
        </Link>
      </div>
    </section>
  );
}
