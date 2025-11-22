import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api/apiClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────
  // 1) Chargement initial /auth/me
  // ────────────────────────────────
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth(silent = false) {
    if (!silent) setLoading(true);

    try {
      const data = await apiFetch("/auth/me");

      if (data.success && data.user) {
        let roles = data.user.roles || [];
        if (typeof roles === "string") {
          roles = [roles];
        }

        const userData = {
          ...data.user,
          roles,
        };

        setUser(userData);
        return userData;
      } else {
        setUser(null);
        return null;
      }

    } catch (err) {
      setUser(null);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // ────────────────────────────────
  // 2) Register
  // ────────────────────────────────
  const register = async (userData) => {
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // ✅ Important pour les cookies
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        // ✅ VÉRIFIER QUE data.user EXISTE
        if (data.user) {
          setUser(data.user); // ✅ Mettre à jour le contexte
          return data.user;
        } else {
          throw new Error("Données utilisateur manquantes dans la réponse");
        }
      } else {
        throw new Error(data.message || "Erreur d'inscription");
      }
    } catch (error) {
      console.error("❌ Erreur dans register():", error);
      throw error;
    }
  };

  // ────────────────────────────────
  // 3) Login (existant)
  // ────────────────────────────────
  async function login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!data.success) {
      throw new Error(data.message || "Identifiants incorrects");
    }

    // Récupère les données utilisateur
    const userData = await checkAuth(true);

    // Retourne les données pour que les composants puissent les utiliser
    return userData;
  }

  // ────────────────────────────────
  // 3) Logout
  // ────────────────────────────────
  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  }

  function normalizeRole(role) {
    return role
      .toLowerCase()
      .replace("é", "e")
  }

  // ────────────────────────────────
  // 4) Helper : vérifier rôle
  // ────────────────────────────────
  function hasRole(role) {
    if (!user || !user.roles) return false;

    const roles = user.roles.map(r => normalizeRole(r));
    const target = normalizeRole(role);

    return roles.includes(target);
  }

  return (
    <UserContext.Provider value={{
      user,
      loading,
      setUser,
      checkAuth,
      register,
      login,
      logout,
      hasRole
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);