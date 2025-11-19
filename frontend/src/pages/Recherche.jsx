import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

export default function Recherche() {
  const [searchParams, setSearchParams] = useState({
    depart: "",
    arrivee: "",
    date: "",
    prix_max: "",
    places_min: 1
  });
  
  const [trajets, setTrajets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-recherche au chargement (trajets récents)
  useEffect(() => {
    loadRecentTrajets();
  }, []);

  const loadRecentTrajets = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/trajets/search");
      
      if (data.success) {
        setTrajets(data.trajets || []);
      }
    } catch (err) {
      console.error("Erreur trajets récents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      
      if (searchParams.depart) params.append('depart', searchParams.depart);
      if (searchParams.arrivee) params.append('arrivee', searchParams.arrivee);
      if (searchParams.date) params.append('date', searchParams.date);
      if (searchParams.prix_max) params.append('prix_max', searchParams.prix_max);
      if (searchParams.places_min > 1) params.append('places_min', searchParams.places_min);

      const data = await apiFetch(`/trajets/search?${params}`);
      
      if (data.success) {
        setTrajets(data.trajets || []);
      }
    } catch (err) {
      console.error("Erreur recherche:", err);
      setTrajets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSearchParams(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trouvez votre trajet
          </h1>
          <p className="text-gray-600">
            Recherchez parmi les trajets disponibles
          </p>
        </div>

        {/* Formulaire de recherche */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            
            {/* Ligne 1 : Départ et Arrivée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🚩 Départ
                </label>
                <input
                  type="text"
                  name="depart"
                  value={searchParams.depart}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                  placeholder="Ex: Paris, Lyon..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Arrivée
                </label>
                <input
                  type="text"
                  name="arrivee"
                  value={searchParams.arrivee}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                  placeholder="Ex: Marseille, Nice..."
                />
              </div>
            </div>

            {/* Ligne 2 : Date, Prix et Places */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📅 Date de départ
                </label>
                <input
                  type="date"
                  name="date"
                  value={searchParams.date}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💰 Prix maximum (Crédits)
                </label>
                <input
                  type="number"
                  name="prix_max"
                  value={searchParams.prix_max}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                  placeholder="Ex: 50"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  👥 Nombre de places
                </label>
                <select
                  name="places_min"
                  value={searchParams.places_min}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-brand-dark"
                >
                  <option value={1}>1 place</option>
                  <option value={2}>2 places</option>
                  <option value={3}>3 places</option>
                  <option value={4}>4 places</option>
                </select>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-dark text-white py-3 px-6 rounded-lg hover:bg-brand-verydark disabled:opacity-50 transition font-medium"
              >
                {loading ? "Recherche..." : "🔍 Rechercher"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSearchParams({
                    depart: "",
                    arrivee: "",
                    date: "",
                    prix_max: "",
                    places_min: 1
                  });
                  setSearched(false);
                  loadRecentTrajets();
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Résultats */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600">🔄 Recherche en cours...</div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  {searched ? "Résultats de recherche" : "Trajets récents"}
                </h2>
                <div className="text-gray-500">
                  {trajets.length} trajet{trajets.length > 1 ? 's' : ''} trouvé{trajets.length > 1 ? 's' : ''}
                </div>
              </div>

              {trajets.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    {searched ? "Aucun trajet trouvé" : "Aucun trajet disponible"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searched 
                      ? "Essayez avec des critères différents"
                      : "Soyez le premier à proposer un trajet !"
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {trajets.map(trajet => (
                    <TrajetCard key={trajet.id} trajet={trajet} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// Composant carte trajet
function TrajetCard({ trajet }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
      <div className="flex items-start justify-between">
        
        {/* Info trajet */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-lg font-semibold text-gray-900">
              {trajet.depart} → {trajet.arrivee}
            </div>
            <div className="text-sm text-gray-500">
              📅 {formatDate(trajet.date_depart)}
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <span>👤</span>
              <span>{trajet.nom} {trajet.prenom}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{trajet.places_restantes || trajet.places_disponibles} place{(trajet.places_restantes || trajet.places_disponibles) > 1 ? 's' : ''} restante{(trajet.places_restantes || trajet.places_disponibles) > 1 ? 's' : ''}</span>
            </div>
          </div>

          {trajet.description && (
            <p className="text-gray-600 text-sm mb-4">{trajet.description}</p>
          )}
        </div>

        {/* Prix et action */}
        <div className="text-right ml-6">
          <div className="text-2xl font-bold text-brand-dark mb-3">
            {trajet.prix}€
          </div>
          
          <Link
            to={`/trajet/${trajet.id}`}
            className="inline-flex items-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark transition text-sm"
          >
            Voir détails →
          </Link>
        </div>

      </div>
    </div>
  );
}