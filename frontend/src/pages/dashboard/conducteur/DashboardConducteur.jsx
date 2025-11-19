// src/pages/dashboard/conducteur/DashboardConducteur.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";
import { useUser } from "../../../context/UserContext";

export default function DashboardConducteur() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const res = await apiFetch("/conducteur/stats");
    if (res.success) setStats(res.data);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Bienvenue Conducteur 👨‍✈️</h1>
      <p className="text-gray-600">Bonjour {user.prenom}, voici votre espace.</p>

      {/* --- Stats rapides --- */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-bold text-xl">{stats.trajetsPublies}</h2>
            <p className="text-gray-500">Trajets publiés</p>
          </div>

          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-bold text-xl">{stats.totalReservations}</h2>
            <p className="text-gray-500">Réservations reçues</p>
          </div>

          <div className="p-4 bg-white shadow rounded">
            <h2 className="font-bold text-xl">{stats.creditsGagnes} crédits</h2>
            <p className="text-gray-500">Crédits gagnés</p>
          </div>
        </div>
      )}

      {/* --- Actions rapides --- */}
      <div className="mt-10 flex gap-4">
        <Link
          to="/dashboard/conducteur/mes-trajets"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Mes trajets
        </Link>

        <Link
          to="/dashboard/conducteur/nouveau"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Publier un trajet
        </Link>
      </div>
    </div>
  );
}
