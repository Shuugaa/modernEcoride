import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

function Analytics() {
  const [stats, setStats] = useState(null);
  const [recherchesRecentes, setRecherchesRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsData, recherchesData] = await Promise.all([
        apiFetch('/analytics/recherches/stats'),
        apiFetch('/analytics/recherches/recent?limit=50')
      ]);

      if (statsData.success) setStats(statsData);
      if (recherchesData.success) setRecherchesRecentes(recherchesData.recherches);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        <span className="ml-4 text-gray-600">Chargement des analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📊 Analytics EcoRide
        </h1>
        <p className="text-gray-600">
          Analyse des recherches et comportements utilisateurs
        </p>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '📈 Vue d\'ensemble' },
            { id: 'searches', label: '🔍 Recherches' },
            { id: 'trends', label: '📊 Tendances' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeView === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      {activeView === 'overview' && (
        <OverviewSection stats={stats} />
      )}

      {activeView === 'searches' && (
        <SearchesSection recherches={recherchesRecentes} />
      )}

      {activeView === 'trends' && (
        <TrendsSection stats={stats} />
      )}
    </div>
  );
};

// Section Vue d'ensemble
function OverviewSection({ stats }) {
  if (!stats?.stats) return <div>Pas de données disponibles</div>;

  return (
    <div className="space-y-6">
      {/* Stats principales */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Recherches</p>
              <p className="text-3xl font-bold">{stats.stats.total_recherches}</p>
            </div>
            <div className="text-4xl">🔍</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Recherches Connectées</p>
              <p className="text-3xl font-bold">{stats.stats.recherches_connectees}</p>
            </div>
            <div className="text-4xl">👤</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Recherches Anonymes</p>
              <p className="text-3xl font-bold">{stats.stats.recherches_anonymes}</p>
            </div>
            <div className="text-4xl">🔒</div>
          </div>
        </div>
      </div>

      {/* Top destinations */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          🎯 Top 10 Destinations les Plus Recherchées
        </h3>
        <div className="space-y-3">
          {stats.top_destinations?.slice(0, 10).map((dest, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <span className="bg-brand-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <span className="font-medium">
                  {dest._id.depart || '?'} → {dest._id.arrivee || '?'}
                </span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {dest.count} recherches
              </span>
            </div>
          )) || <p className="text-gray-500">Aucune donnée disponible</p>}
        </div>
      </div>
    </div>
  );
}

// Section Recherches (VERSION CORRIGÉE)
function SearchesSection({ recherches }) {
  const [filter, setFilter] = useState('all');

  // ✅ CALCULER filteredRecherches À LA VOLÉE au lieu d'utiliser un state
  const filteredRecherches = React.useMemo(() => {
    if (filter === 'connected') {
      return recherches.filter(r => r.userId);
    } else if (filter === 'anonymous') {
      return recherches.filter(r => !r.userId);
    }
    return recherches; // 'all'
  }, [filter, recherches]);

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Toutes ({recherches.length})
        </button>
        <button
          onClick={() => setFilter('connected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'connected' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Connectées ({recherches.filter(r => r.userId).length})
        </button>
        <button
          onClick={() => setFilter('anonymous')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'anonymous' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Anonymes ({recherches.filter(r => !r.userId).length})
        </button>
      </div>

      {/* État actuel */}
      <div className="text-sm text-gray-600">
        📊 Affichage : <strong>{filteredRecherches.length}</strong> recherche(s) 
        {filter !== 'all' && ` (filtre: ${filter})`}
      </div>

      {/* Table des recherches */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredRecherches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recherche</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filtres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecherches.map((recherche, index) => (
                  <tr key={recherche._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(recherche.createdAt).toLocaleDateString('fr-FR')}
                      <br />
                      <span className="text-xs text-gray-400">
                        {new Date(recherche.createdAt).toLocaleTimeString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {recherche.userId ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          👤 User #{recherche.userId}
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                          🔒 Anonyme
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">
                          {recherche.depart || 'Toutes villes'} → {recherche.arrivee || 'Toutes villes'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {recherche.filters?.date && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            📅 {recherche.filters.date}
                          </span>
                        )}
                        {recherche.filters?.prix_max && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            💰 ≤{recherche.filters.prix_max}€
                          </span>
                        )}
                        {recherche.filters?.places_min && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            👥 ≥{recherche.filters.places_min}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune recherche trouvée</h3>
            <p className="text-gray-500">
              {filter === 'connected' && 'Aucune recherche d\'utilisateurs connectés'}
              {filter === 'anonymous' && 'Aucune recherche anonyme'}
              {filter === 'all' && 'Aucune donnée de recherche disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Section Tendances
function TrendsSection({ stats }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">📊 Tendances de Recherche</h3>
        
        {stats?.recherches_by_day?.length > 0 ? (
          <div className="space-y-3">
            {stats.recherches_by_day.map((day, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{day._id}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-brand-500 h-2 rounded-full" 
                      style={{
                        width: `${(day.count / Math.max(...stats.recherches_by_day.map(d => d.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Pas assez de données pour afficher les tendances</p>
        )}
      </div>
    </div>
  );
}

export default Analytics;