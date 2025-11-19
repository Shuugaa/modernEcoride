import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/stats");
      
      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des statistiques...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Erreur : {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Statistiques du Site</h2>
        <button 
          onClick={loadStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Utilisateurs */}
        <StatCard
          title="Utilisateurs"
          value={stats.total_utilisateurs}
          icon="👥"
          color="blue"
          subtitle="Total inscrits"
        />

        {/* Trajets */}
        <StatCard
          title="Trajets"
          value={stats.total_trajets}
          icon="🚗"
          color="green"
          subtitle="Trajets créés"
        />

        {/* Réservations */}
        <StatCard
          title="Réservations"
          value={stats.total_reservations}
          icon="📋"
          color="purple"
          subtitle="Réservations faites"
        />

        {/* Revenus */}
        <StatCard
          title="Revenus"
          value={`${stats.revenus_total}€`}
          icon="💰"
          color="yellow"
          subtitle="Chiffre d'affaires"
        />
      </div>

      {/* Répartition des rôles */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Répartition des Utilisateurs</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.passagers || 0}
            </div>
            <div className="text-sm text-gray-600">Passagers</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.conducteurs || 0}
            </div>
            <div className="text-sm text-gray-600">Conducteurs</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.employes || 0}
            </div>
            <div className="text-sm text-gray-600">Employés</div>
          </div>

          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.administrateurs || 0}
            </div>
            <div className="text-sm text-gray-600">Administrateurs</div>
          </div>

        </div>
      </div>

      {/* Statistiques des trajets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Statuts des réservations */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">État des Réservations</h3>
          <div className="space-y-3">
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En attente</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{
                      width: `${stats.total_reservations ? (stats.reservations_en_attente / stats.total_reservations * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium">{stats.reservations_en_attente || 0}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Confirmées</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{
                      width: `${stats.total_reservations ? (stats.reservations_confirmees / stats.total_reservations * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium">{stats.reservations_confirmees || 0}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Refusées</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{
                      width: `${stats.total_reservations ? (stats.reservations_refusees / stats.total_reservations * 100) : 0}%`
                    }}
                  ></div>
                </div>
                <span className="font-medium">{stats.reservations_refusees || 0}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Activité Récente</h3>
          <div className="space-y-3">
            
            <div className="flex justify-between">
              <span className="text-gray-600">Nouveaux utilisateurs (7j)</span>
              <span className="font-medium text-green-600">
                +{stats.nouveaux_utilisateurs_7j || 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Nouveaux trajets (7j)</span>
              <span className="font-medium text-blue-600">
                +{stats.nouveaux_trajets_7j || 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Réservations (7j)</span>
              <span className="font-medium text-purple-600">
                +{stats.nouvelles_reservations_7j || 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Revenus (7j)</span>
              <span className="font-medium text-yellow-600">
                +{stats.revenus_7j || 0}€
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* Utilisateurs actifs */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Utilisateurs par Statut</h3>
        <div className="grid grid-cols-2 gap-6">
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-lg font-semibold text-green-700">Actifs</div>
              <div className="text-sm text-green-600">Comptes activés</div>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {stats.utilisateurs_actifs || 0}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <div className="text-lg font-semibold text-red-700">Inactifs</div>
              <div className="text-sm text-red-600">Comptes désactivés</div>
            </div>
            <div className="text-2xl font-bold text-red-700">
              {stats.utilisateurs_inactifs || 0}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// Composant pour les cartes de stats
function StatCard({ title, value, icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-60 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}