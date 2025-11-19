// src/pages/dashboard/sidebar/DashboardSidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

function Item({ to, children }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={
        "flex items-center gap-3 px-4 py-2 rounded-md text-sm hover:bg-gray-100 " +
        (active ? "bg-gray-100 font-semibold" : "text-gray-700")
      }
    >
      {children}
    </Link>
  );
}

export default function DashboardSidebar() {
  const { user, hasRole } = useUser();

  return (
    <aside className="w-72 bg-white border-r h-screen sticky top-0">
      <div className="p-4 border-b">
        {/* logo (optionnel) */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌿</div>
          <div>
            <div className="font-bold">Carpool Nature</div>
            <div className="text-xs text-gray-500">Tableau de bord</div>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {/* Général */}
        <div className="text-xs uppercase text-gray-400 px-2 mb-2">Général</div>
        <Item to="/dashboard">Accueil</Item>
        <Item to="/recherche">Rechercher</Item>

        {/* Passager */}
        {hasRole("passager") && (
          <>
            <div className="text-xs uppercase text-gray-400 px-2 mt-4 mb-2">Passager</div>
            <Item to="/dashboard#passager">Mes réservations</Item>
            <Item to="/recherche">Rechercher un trajet</Item>
            <Item to="/reservations/mine">Réservations en cours</Item>
          </>
        )}

        {/* Conducteur */}
        {hasRole("conducteur") && (
          <>
            <div className="text-xs uppercase text-gray-400 px-2 mt-4 mb-2">Conducteur</div>
            <Item to="/trajets/list">Mes trajets</Item>
            <Item to="/trajets/new">Publier un trajet</Item>
            <Item to="/trajets/reservations">Réservations reçues</Item>
            <Item to="/dashboard#conducteur">Statistiques</Item>
          </>
        )}

        {/* Employé / Admin */}
        {hasRole("employe") && (
          <>
            <div className="text-xs uppercase text-gray-400 px-2 mt-4 mb-2">Employé</div>
            <Item to="/employe/dashboard">Espace employé</Item>
          </>
        )}

        {hasRole("admin") && (
          <>
            <div className="text-xs uppercase text-gray-400 px-2 mt-4 mb-2">Admin</div>
            <Item to="/admin">Administration</Item>
          </>
        )}
      </nav>

      {/* footer credits / user */}
      <div className="mt-auto p-4 border-t">
        {user && (
          <div className="text-sm">
            <div className="font-semibold">{user.prenom} {user.nom}</div>
            <div className="text-gray-500 text-xs">🔋 {user.credits} crédits</div>
          </div>
        )}
      </div>
    </aside>
  );
}
