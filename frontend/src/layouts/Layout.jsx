// src/components/Layout.jsx
import { Link, Outlet } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import { useUser } from "../context/UserContext";

export default function Layout() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <header className="bg-brand-dark text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide flex items-center gap-2 hover:text-green-200 transition"
          >
            🌿 Carpool Nature
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-8 font-medium">

            <Link to="/" className="hover:text-green-200 transition">
              Accueil
            </Link>

            <Link to="/recherche" className="hover:text-green-200 transition">
              Rechercher
            </Link>

            <Link to="/about" className="hover:text-green-200 transition">
              À propos
            </Link>
            
            {/* Menu utilisateur (dropdown) */}
            <UserMenu />
          </nav>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-dark text-white text-center py-4 mt-10">
        © {new Date().getFullYear()} Carpool Nature — Tous droits réservés.
      </footer>
    </div>
  );
}
