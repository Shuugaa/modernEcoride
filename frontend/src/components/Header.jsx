// src/components/Header.jsx
import { Link } from "react-router-dom";
import UserMenu from "./UserMenu";

export default function Header() {
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

          {/* Menu utilisateur (affichage dynamique) */}
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
