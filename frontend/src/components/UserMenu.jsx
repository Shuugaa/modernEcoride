// src/components/UserMenu.jsx
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function UserMenu() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Pas connecté → menu simple
  if (!user) {
    return (
      <div className="flex gap-4 text-white">
        <Link className="hover:text-green-200" to="/login">
          Connexion
        </Link>
        <Link className="hover:text-green-200" to="/register">
          Inscription
        </Link>
      </div>
    );
  }

  // Connecté → menu utilisateur
  return (
    <div className="flex items-center gap-4 text-white">

      <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
        Bonjour {user.prenom}
      </span>

      <span className="bg-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
        🔋 {user.credits} crédits

        {/* Lien vers la page de recharge */}
        <Link
          to="/credits"
          className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
          title="Recharger mes crédits"
        >
          ➕
        </Link>
      </span>

      <span>
        <Link
          to="/trajets"
          className="bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-xs"
          title="Mes trajets"
        >
          🚗
        </Link>
      </span>

      <button
        onClick={handleLogout}
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
      >
        Déconnexion
      </button>
    </div>
  );
}
