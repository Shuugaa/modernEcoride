import { Link, Outlet } from "react-router-dom";
import UserMenu from "../components/UserMenu";
import { useUser } from "../context/UserContext";

export default function Layout() {

  const { user, loading, hasRole } = useUser();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HEADER */}
      <header className="bg-brand-dark text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
            🌿 Carpool Nature
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center gap-6 font-medium">

            <Link to="/" className="hover:underline">Accueil</Link>
            <Link to="/recherche" className="hover:underline">Rechercher</Link>
            <Link to="/about" className="hover:underline">À propos</Link>

            {user && (
              <>
                {hasRole("conducteur") && (
                  <Link to="/dashboard/conducteur" className="hover:underline">
                    Espace Conducteur
                  </Link>
                )}

                {hasRole("passager") && (
                  <Link to="/dashboard/passager" className="hover:underline">
                    Espace Passager
                  </Link>
                )}

                {hasRole("employe") && (
                  <Link to="/dashboard/employe" className="hover:underline">
                    Espace Employé
                  </Link>
                )}

                {hasRole("admin") && (
                  <Link to="/dashboard/admin" className="hover:underline">
                    Admin
                  </Link>
                )}
              </>
            )}

            {/* MENU UTILISATEUR */}
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/login" className="hover:underline">Connexion</Link>
            )}

          </nav>

        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-brand-dark text-white text-center py-4 mt-8">
        © {new Date().getFullYear()} Carpool Nature — Tous droits réservés.
      </footer>
    </div>
  );
}
