import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import ToggleConducteur from "../modules/ToggleConducteur";

export default function DashboardSidebar({ onNavigate }) {
  const { user } = useUser();
  const navigate = useNavigate();

  const userRoles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);

  // ✅ Fonction pour gérer les clics (ferme la sidebar mobile)
  const handleNavClick = (path) => {
    navigate(path);
    if (onNavigate) onNavigate(); // Fermer la sidebar mobile
  };

  return (
    <div className="sticky top-6">
      <div className="bg-white p-4 rounded-xl shadow">
        {/* header */}
        <div className="flex items-center gap-3 mb-4">
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
          <button 
            onClick={() => handleNavClick("/dashboard/recharge-credits")}
            className="text-xs text-green-600 hover:underline"
          >
            Recharger
          </button>
        </div>

        {(userRoles.includes("passager") || userRoles.includes("conducteur")) ? (
          <div className="mb-4">
            <ToggleConducteur />
          </div>
        ) : null}

        {/* nav */}
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => handleNavClick("/dashboard")}
            className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
          >
            Accueil dashboard
          </button>

          {/* modules visibles selon rôles */}
          {userRoles.includes("conducteur") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Conducteur</div>
              <button 
                onClick={() => handleNavClick("/dashboard/conducteur")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Mon espace conducteur
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/conducteur/mes-trajets")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Mes trajets
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/conducteur/nouveau")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Nouveau trajet
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/conducteur/vehicules")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                🚗 Mes véhicules
              </button>
            </>
          )}

          {userRoles.includes("passager") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Passager</div>
              <button 
                onClick={() => handleNavClick("/dashboard/passager")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Mon espace passager
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/passager/en-cours")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Réservation en cours
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/passager/historique")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Historique
              </button>
              <button 
                onClick={() => handleNavClick("/recherche")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Rechercher un trajet
              </button>
            </>
          )}

          {userRoles.includes("employe") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Employé</div>
              <button 
                onClick={() => handleNavClick("/dashboard/employe")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Espace employé
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/analytics")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                📊 Analytics
              </button>
            </>
          )}

          {userRoles.includes("administrateur") && (
            <>
              <div className="mt-2 text-xs text-gray-500 px-3">Admin</div>
              <button 
                onClick={() => handleNavClick("/dashboard/admin")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                Administration
              </button>
              <button 
                onClick={() => handleNavClick("/dashboard/analytics")}
                className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                📊 Analytics
              </button>
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