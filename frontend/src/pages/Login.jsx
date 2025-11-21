// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { login, user } = useUser();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  try {
    const userData = await login(email, password);
    
    // Si on a les données utilisateur, on peut rediriger
    if (userData && userData.roles && userData.roles.length > 0) {
      console.log("✅ Redirection vers /dashboard");
      nav("/dashboard");
    } else {
      console.log("❌ Pas de redirection - userData invalide");
    }
  } catch (err) {
    console.error("💥 Erreur login:", err);
    setError(err.message);
  }
}

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Connexion</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button className="bg-green-600 text-white py-2 rounded">
          Se connecter
        </button>
        <a href="/register" className="text-center text-sm text-gray-600 hover:underline">
          Pas encore de compte ? Inscrivez-vous
        </a>
      </form>
    </div>
  );
}
