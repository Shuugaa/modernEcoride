// src/components/PrivateRoute.jsx
import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return children;
}
