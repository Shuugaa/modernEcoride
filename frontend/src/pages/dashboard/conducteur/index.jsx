// frontend/src/pages/dashboard/conducteur/index.jsx
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function DashboardConducteur() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur n'est plus conducteur, redirige vers la page passager
    if (user && !user.roles.includes("conducteur")) {
      navigate("/dashboard/passager", { replace: true });
    }
  }, [user?.roles]);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tableau de bord — Conducteur</h1>
      <p className="text-gray-600 mb-6">Bonjour {user?.prenom}, gérez vos trajets et vos réservations ici.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/conducteur/nouveau"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">Créer un nouveau trajet</div>
          <p className="text-sm text-gray-500 mt-1">Publiez un trajet rapidement.</p>
        </Link>

        <Link
          to="/dashboard/conducteur/mes-trajets"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">Mes trajets</div>
          <p className="text-sm text-gray-500 mt-1">Consultez et gérez vos trajets publiés.</p>
        </Link>

        <Link
          to="/dashboard/conducteur/vehicules"
          className="block bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="text-lg font-semibold">🚗 Mes véhicules</div>
          <p className="text-sm text-gray-500 mt-1">Gérez votre flotte de véhicules.</p>
        </Link>
      </div>
    </div>
  );
}
