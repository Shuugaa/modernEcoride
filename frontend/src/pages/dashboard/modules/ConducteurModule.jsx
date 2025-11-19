// dashboard/modules/ConducteurModule.jsx
import { Link } from "react-router-dom";
import { Car, PlusCircle, ClipboardList } from "lucide-react";

export default function ConducteurModule() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Espace Conducteur</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link
          to="/dashboard/conducteur"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <Car size={32} className="text-blue-600 mb-3" />
          <h3 className="font-semibold text-lg">Tableau de bord</h3>
          <p className="text-gray-500 text-sm">
            Aperçu rapide de vos trajets et réservations
          </p>
        </Link>

        <Link
          to="/dashboard/conducteur/new"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <PlusCircle size={32} className="text-green-600 mb-3" />
          <h3 className="font-semibold text-lg">Nouveau trajet</h3>
          <p className="text-gray-500 text-sm">
            Proposer un nouveau trajet à vos passagers
          </p>
        </Link>

        <Link
          to="/dashboard/conducteur/reservations"
          className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col items-start"
        >
          <ClipboardList size={32} className="text-orange-600 mb-3" />
          <h3 className="font-semibold text-lg">Réservations</h3>
          <p className="text-gray-500 text-sm">
            Voir les réservations reçues pour vos trajets
          </p>
        </Link>

      </div>
    </div>
  );
}
