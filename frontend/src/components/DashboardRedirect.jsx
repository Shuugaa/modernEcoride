// src/components/DashboardRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function DashboardRedirect() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Priorité des rôles (1 = plus prioritaire)
  const ROLE_PRIORITY = [
    "administrateur",
    "employe",
    "conducteur",
    "passager",
  ];

  // Tableau des routes liées au rôle
  const ROUTES = {
    administrateur: "/dashboard/admin",
    employe: "/dashboard/employe",
    conducteur: "/dashboard/conducteur",
    passager: "/dashboard/passager",
  };

  useEffect(() => {
    if (!user) return;

    // Rôles renvoyés par le backend (string ou array)
    const roles = Array.isArray(user.roles)
      ? user.roles
      : user.role
      ? [user.role]
      : [];

    if (roles.length === 0) {
      navigate("/unauthorized", { replace: true });
      return;
    }

    // Trouver le rôle le plus prioritaire
    const sortedRoles = [...roles].sort(
      (a, b) =>
        ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b)
    );

    const mainRole = sortedRoles[0];
    const target = ROUTES[mainRole];

    if (target) {
      navigate(target, { replace: true });
    } else {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate]);

  return (
    <p className="text-center text-gray-500 py-10">
      Redirection du tableau de bord...
    </p>
  );
}
