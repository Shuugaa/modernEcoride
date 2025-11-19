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

      if (data.loggedIn) {
        // Normalise les rôles en tableau
        let roles = data.user.roles || [];

        // Si le backend renvoie juste "passager"
        if (typeof roles === "string") {
          roles = [roles];
        }

        setUser({
          ...data.user,
          roles,
        });

      } else {
        setUser(null);
      }

    } catch (err) {
      console.error("❌ erreur /auth/me :", err);
      setUser(null);
    }


    if (!silent) setLoading(false);
  }

  // ────────────────────────────────
  // 2) Login
  // ────────────────────────────────
  async function login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!data.success) {
      throw new Error(data.message || "Identifiants incorrects");
    }

    // Recharge clean depuis /auth/me
    await checkAuth(true);

    return true;
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
      .replace("administrateur", "admin");
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
      login,
      logout,
      hasRole
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
