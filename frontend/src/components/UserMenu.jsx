import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Fermer si clic en dehors
  useEffect(() => {
    function clickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // ---- 🔓 SI NON CONNECTÉ -------------------------
  if (!user) {
    return (
      <div className="flex gap-4 text-white">
        <Link className="hover:text-green-200" to="/login">Connexion</Link>
        <Link className="hover:text-green-200" to="/register">Inscription</Link>
      </div>
    );
  }

  // ---- 🔒 SI CONNECTÉ -----------------------------
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-white hover:bg-white/30 transition"
      >
        👤 {user.prenom}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 z-30 border">

          {/* HEADER */}
          <div className="px-4 py-3 text-sm text-gray-800 border-b">
            <p className="font-semibold">{user.prenom} {user.nom}</p>
            <p className="text-gray-500 text-xs">{user.email}</p>
          </div>

          {/* DASHBOARD */}
          <Link
            to="/dashboard"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            🧭 Tableau de bord
          </Link>

          {/* CREDITS - à créer ou supprimer */}
          <div className="px-4 py-2 text-gray-700 border-b">
            🔋 <strong>{user.credits}</strong> crédits
            {/* <Link to="/credits" className="ml-2 text-green-700 hover:underline text-sm">
            Recharger →
          </Link> */}
          </div>

          {/* PASSAGER - corrigé */}
          {userRoles.includes("passager") && (
            <Link
              to="/dashboard/passager/historique"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              🎒 Mes réservations
            </Link>
          )}

          {/* CONDUCTEUR - corrigé */}
          {userRoles.includes("conducteur") && (
            <Link
              to="/dashboard/conducteur"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              🚗 Espace Conducteur
            </Link>
          )}

          {/* EMPLOYÉ - à créer ou supprimer */}
          {/* {userRoles.includes("employe") && (
          <Link
            to="/dashboard/employe"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            🏢 Espace Employé
          </Link>
        )} */}

          {/* ADMIN - utilise administrateur */}
          {userRoles.includes("administrateur") && (
            <Link
              to="/dashboard/admin"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              🛠️ Administration
            </Link>
          )}

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
          >
            🚪 Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
