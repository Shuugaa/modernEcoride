import { useState } from "react";
import { apiFetch } from "../../../api/apiClient";
import { useUser } from "../../../context/UserContext";

export default function ToggleConducteur() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Logique plus robuste
  const isConducteur = (() => {
    if (user?.roles && Array.isArray(user.roles)) {
      return user.roles.includes("conducteur");
    } else if (user?.role) {
      return user.role === "conducteur";
    }
    return false;
  })();

  const handleToggle = async () => {
    setLoading(true);
    setMessage("");

    try {
      const data = await apiFetch("/user/toggle-conducteur", {
        method: "POST"
      });

      if (data.success) {

        setUser(prev => {
          const newUser = {
            ...prev,
            roles: data.roles
          };
          return newUser;
        });

        setMessage(data.message);
      }

    } catch (err) {
      setMessage(err.message || "Erreur lors du changement de rôle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Devenir Conducteur</h3>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          {isConducteur
            ? "Vous êtes actuellement conducteur. Vous pouvez créer des trajets."
            : "Devenez conducteur pour proposer des trajets et gagner de l'argent !"
          }
        </p>

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isConducteur
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
          }`}>
          {isConducteur ? "🚗 Conducteur" : "🎒 Passager uniquement"}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes("Erreur")
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
          }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-medium transition ${isConducteur
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-green-600 text-white hover:bg-green-700"
          } disabled:opacity-50`}
      >
        {loading
          ? "..."
          : isConducteur
            ? "Arrêter d'être conducteur"
            : "Devenir conducteur"
        }
      </button>
    </div>
  );
}