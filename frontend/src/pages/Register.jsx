import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { apiFetch } from "../api/apiClient";

export default function Register() {
  const nav = useNavigate();
  const { setUser } = useUser();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("passager");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();
    setError("");

    let rolesToSend = role === "both" ? ["passager", "conducteur"] : [role];

    const data = await apiFetch("/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom, prenom, email, password, roles: rolesToSend }),
    });

    if (!data.success) {
      setError(data.message || "Erreur lors de l’inscription.");
      return;
    }

    setUser(data.user);
    nav("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-lg shadow-md border border-brand-light">

      <h2 className="text-3xl font-bold text-brand-verydark mb-4 text-center">
        Inscription
      </h2>

      <p className="text-center text-gray-600 mb-6">
        Rejoignez notre communauté de covoiturage 🚗🌿
      </p>

      <form className="flex flex-col gap-4" onSubmit={register}>

        {/* Nom */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Nom
          </label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : Durand"
          />
        </div>

        {/* Prénom */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Prénom
          </label>
          <input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : Marie"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : marie@example.com"
          />
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Mot de passe
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="Choisissez un mot de passe"
          />
        </div>

        {/* Choix du rôle */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Vous êtes :
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-brand-light rounded p-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-dark"
          >
            <option value="passager">Passager</option>
            <option value="conducteur">Conducteur</option>
            <option value="both">Passager et Conducteur</option>
          </select>
        </div>

        {/* Erreur */}
        {error && (
          <p className="text-red-500 text-center font-semibold">{error}</p>
        )}

        {/* Bouton */}
        <button
          className="bg-brand-dark hover:bg-brand-verydark text-white p-2 rounded transition font-semibold"
        >
          S'inscrire
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Déjà un compte ?
        <a href="/login" className="text-brand-dark hover:text-brand-verydark ml-1 font-semibold">
          Se connecter
        </a>
      </p>
    </div>
  );
}
