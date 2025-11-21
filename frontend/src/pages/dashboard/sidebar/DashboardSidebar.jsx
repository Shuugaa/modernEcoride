// frontend/src/pages/dashboard/sidebar/DashboardSidebar.jsx
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import ToggleConducteur from "../modules/ToggleConducteur";

export default function DashboardSidebar() {
  const { user } = useUser();

  const userRoles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
  
  return (
    <div className="sticky top-6">
      <div className="bg-white p-4 rounded-xl shadow">
        {/* header */}
        <div className="flex items-center gap-3 mb-4">
          {/* image preview using your uploaded file */}
          <img src="logo.png" alt="logo" className="w-12 h-12 rounded-full object-cover" />
          <div>
            <div className="font-semibold">{user?.prenom ?? "Utilisateur"}</div>
            <div className="text-xs text-gray-500">{user?.email ?? "—"}</div>
          </div>
        </div>

        {/* credits */}
        <div className="mb-4 border rounded p-3 bg-gray-50">
          <div className="text-sm text-gray-600">Crédits</div>
          <div className="font-bold">{user?.credits ?? 0} ⚡</div>
          <Link to="/dashboard/recharge-credits" className="text-xs text-green-600 hover:underline">Recharger</Link>
        </div>

        {(userRoles.includes("passager") || userRoles.includes("conducteur")) ? (
          <div className="mb-4">
            <ToggleConducteur />
          </div>
        ) : null}

        {/* nav */}
        <nav className="flex flex-col gap-1">
          <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-100">Accueil dashboard</Link>

          {/* modules visibles selon rôles */}
          {userRoles.includes("conducteur") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Conducteur</div>
              <Link to="/dashboard/conducteur" className="block px-3 py-2 rounded hover:bg-gray-100">Mon espace conducteur</Link>
              <Link to="/dashboard/conducteur/mes-trajets" className="block px-3 py-2 rounded hover:bg-gray-100">Mes trajets</Link>
              <Link to="/dashboard/conducteur/nouveau" className="block px-3 py-2 rounded hover:bg-gray-100">Nouveau trajet</Link>
            </>
          )}

          {userRoles.includes("passager") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Passager</div>
              <Link to="/dashboard/passager" className="block px-3 py-2 rounded hover:bg-gray-100">Mon espace passager</Link>
              <Link to="/dashboard/passager/en-cours" className="block px-3 py-2 rounded hover:bg-gray-100">Réservation en cours</Link>
              <Link to="/dashboard/passager/historique" className="block px-3 py-2 rounded hover:bg-gray-100">Historique</Link>
              <Link to="/recherche" className="block px-3 py-2 rounded hover:bg-gray-100">Rechercher un trajet</Link>
            </>
          )}

          {userRoles.includes("employe") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Employé</div>
              <Link to="/dashboard/employe" className="block px-3 py-2 rounded hover:bg-gray-100">Espace employé</Link>
              <Link to="/dashboard/analytics" className="block px-3 py-2 rounded hover:bg-gray-100">
                📊 Analytics
              </Link>
            </>
          )}

          {userRoles.includes("administrateur") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Admin</div>
              <Link to="/dashboard/admin" className="block px-3 py-2 rounded hover:bg-gray-100">Administration</Link>
              <Link to="/dashboard/analytics" className="block px-3 py-2 rounded hover:bg-gray-100">
                📊 Analytics
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* small help card */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="bg-white rounded-xl p-3 shadow">
          Besoin d'aide ? Consulte la documentation interne ou contacte l'équipe.
        </div>
      </div>
    </div>
  );
}