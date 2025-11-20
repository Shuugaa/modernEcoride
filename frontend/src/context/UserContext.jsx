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
    console.error("❌ Erreur checkAuth:", err);
    setUser(null);
    return null;
  } finally {
    if (!silent) setLoading(false);
  }
}

  // ────────────────────────────────
  // 2) Register
  // ────────────────────────────────
  async function register(userData) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (!data.success) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }

    // Utilise checkAuth comme pour login
    const userDataResult = await checkAuth(true);
    return userDataResult;
  }

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