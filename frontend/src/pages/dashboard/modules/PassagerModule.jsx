// src/pages/dashboard/modules/PassagerModule.jsx
import { Link } from "react-router-dom";

export default function PassagerModule() {
  return (
    <section className="p-6 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-semibold mb-2">Espace Passager</h2>
      <p className="text-gray-600 mb-4">
        Réservez des trajets, suivez vos réservations et gérez vos crédits.
      </p>

      <div className="flex gap-3">
        <Link
          to="/recherche"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Rechercher un trajet 🔍
        </Link>

        <Link
          to="/reservations"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          Mes réservations 📄
        </Link>
      </div>
    </section>
  );
}
