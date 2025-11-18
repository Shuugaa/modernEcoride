// src/components/Header.jsx
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user } = useUser();
  return (
    <header className="bg-green-600 text-white shadow">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        
        {/* Logo / Titre */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <span role="img" aria-label="leaf">🌿</span> Carpool Nature
        </Link>

        {/* Navigation principale */}
        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-green-200">Accueil</Link>
          <Link to="/search" className="hover:text-green-200">Rechercher</Link>
          <Link to="/dashboard" className="hover:text-green-200">Tableau de bord</Link>
          {user && user.roles.includes("conducteur") ? (
          <Link to="/trajets" className="hover:text-green-200">Mes trajets</Link>
          ) : <Link to="/become-driver" className="hover:text-green-200">Devenir conducteur</Link>}
          <Link to="/about" className="hover:text-green-200">À propos</Link>

          {/* Menu utilisateur (affichage dynamique) */}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
