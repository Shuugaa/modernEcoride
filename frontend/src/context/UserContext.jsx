// src/context/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api/apiClient";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth(); // Vérification initiale
  }, []);

  async function checkAuth(silent = false) {
    if (!silent) setLoading(true);

    try {
      const data = await apiFetch("/auth/me");
      setUser(data.loggedIn ? data.user : null);
    } catch {
      setUser(null);
    }

    if (!silent) setLoading(false);
  }

  async function login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!data.success) {
      throw new Error(data.message || "Identifiants incorrects");
    }

    // Reload complet des infos depuis /auth/me
    await checkAuth(true);

    return user; // toujours l'utilisateur à jour
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
  }

  function hasRole(...roles) {
    if (!user?.roles) return false;
    return roles.some(r => user.roles.includes(r));
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading, checkAuth, login, logout, hasRole }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
