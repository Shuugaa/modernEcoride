import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Register() {
  const nav = useNavigate();
  const { register: registerUser } = useUser();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("passager");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ Validation côté client
      if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
        throw new Error("Tous les champs sont obligatoires");
      }

      if (password.length < 6) {
        throw new Error("Le mot de passe doit faire au moins 6 caractères");
      }

      if (!email.includes('@')) {
        throw new Error("Adresse email invalide");
      }

      if (role == "administrateur" || role == "employe") {
        throw new Error("Rôle invalide sélectionné");
      }

      // Préparer les rôles à envoyer
      let rolesToSend = role === "both" ? ["passager", "conducteur"] : [role];

      const userData = await registerUser({ 
        nom: nom.trim(), 
        prenom: prenom.trim(), 
        email: email.trim(), 
        password, 
        roles: rolesToSend 
      });

      console.log("✅ Inscription réussie:", userData); // DEBUG

      // ✅ Vérifier que les données sont bien là
      if (userData && userData.roles && userData.roles.length > 0) {
        nav("/dashboard");
      } else {
        throw new Error("Inscription réussie mais données manquantes");
      }

    } catch (err) {
      console.error("❌ Erreur inscription:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 mt-10 rounded-lg shadow-md border border-brand-light">

      <h2 className="text-3xl font-bold text-brand-verydark mb-4 text-center">
        Inscription
      </h2>

      <p className="text-center text-gray-600 mb-6">
        Rejoignez notre communauté de covoiturage 🚗🌿
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

        {/* Nom */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Nom *
          </label>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : Durand"
            required
            disabled={loading}
          />
        </div>

        {/* Prénom */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Prénom *
          </label>
          <input
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : Marie"
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Email *
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="ex : marie@example.com"
            required
            disabled={loading}
          />
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col">
          <label className="text-sm text-brand-verydark font-semibold mb-1">
            Mot de passe *
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="border border-brand-light rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
            placeholder="Minimum 6 caractères"
            required
            minLength={6}
            disabled={loading}
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
            disabled={loading}
          >
            <option value="passager">🚗 Passager</option>
            <option value="both">🚗🚙 Passager et Conducteur</option>
          </select>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-dark hover:bg-brand-verydark text-white p-2 rounded transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Inscription en cours...
            </span>
          ) : (
            "S'inscrire"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-gray-600">
        Déjà un compte ?
        <Link 
          to="/login" 
          className="text-brand-dark hover:text-brand-verydark ml-1 font-semibold"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}