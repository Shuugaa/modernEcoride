// src/components/DashboardRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function DashboardRedirect() {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const role = user.role; // ton backend renvoie probablement user.role

    // Redirections selon rôle
    const routesByRole = {
      conducteur: "/dashboard/conducteur",
      passager: "/dashboard/passager",
      employe: "/dashboard/employe",
      admin: "/dashboard/admin",
    };

    if (routesByRole[role]) {
      navigate(routesByRole[role], { replace: true });
    } else {
      // Si aucun rôle valide → page fallback
      navigate("/dashboard/unauthorized", { replace: true });
    }

  }, [user, navigate]);

  return (
    <p className="text-center text-gray-500 py-10">
      Redirection du tableau de bord...
    </p>
  );
}
