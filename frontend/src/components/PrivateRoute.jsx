import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function PrivateRoute({ children, roles }) {
  const { user, isLoading } = useUser();

  // Pendant chargement user
  if (isLoading) {
    return (
      <p className="text-center text-gray-500 py-8">
        Chargement de votre session...
      </p>
    );
  }

  // Pas connecté → Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si aucune restriction de rôle → accès OK
  if (!roles) {
    return children;
  }

  // Gestion multi-rôles
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : [user.role]; // supporte role ou roles[]

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  // Vérifie si user possède au moins un rôle requis
  const hasAccess = requiredRoles.some(r => userRoles.includes(r));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
