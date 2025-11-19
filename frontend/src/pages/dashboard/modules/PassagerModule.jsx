// dashboard/modules/PassagerModule.jsx
import { Link } from "react-router-dom";
import { Search, Clock, TicketCheck } from "lucide-react";

export default function PassagerModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Espace Passager</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          to="/dashboard/passager"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <Clock size={32} className="text-blue-600 mb-3" />
          <h3 className="font-semibold text-lg">Trajets en cours</h3>
          <p className="text-gray-500 text-sm">
            Consultez vos réservations actives
          </p>
        </Link>

        <Link
          to="/recherche"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <Search size={32} className="text-green-600 mb-3" />
          <h3 className="font-semibold text-lg">Rechercher un trajet</h3>
          <p className="text-gray-500 text-sm">
            Trouvez un conducteur pour vos déplacements
          </p>
        </Link>

        <Link
          to="/dashboard/passager/historique"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <TicketCheck size={32} className="text-purple-600 mb-3" />
          <h3 className="font-semibold text-lg">Historique</h3>
          <p className="text-gray-500 text-sm">
            Retrouvez vos réservations passées
          </p>
        </Link>

      </div>
    </div>
  );
}
