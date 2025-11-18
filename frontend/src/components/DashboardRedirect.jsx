// src/components/DashboardRedirect.jsx
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function DashboardRedirect() {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" />;

  return (
    user.role === "conducteur"
      ? <Navigate to="/dashboard/conducteur" />
      : <Navigate to="/dashboard/passager" />
  );
}
