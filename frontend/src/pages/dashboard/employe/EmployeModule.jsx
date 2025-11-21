// frontend/src/pages/dashboard/employe/EmployeModule.jsx
import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";


function parseRoles(roles) {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;

  try {
    return JSON.parse(roles);
  } catch (error) {
    console.warn('Erreur parsing roles:', roles, error);
    return [];
  }
}

export default function EmployeModule() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // States pour chaque section
  const [stats, setStats] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [trajets, setTrajets] = useState([]);
  const [tickets, setTickets] = useState([]);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (activeTab === 'dashboard') loadStats();
    if (activeTab === 'utilisateurs') loadUtilisateurs();
    if (activeTab === 'trajets') loadTrajets();
    if (activeTab === 'support') loadTickets();
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/employe/dashboard");
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Erreur stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUtilisateurs = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/employe/utilisateurs");
      if (data.success) {
        setUtilisateurs(data.utilisateurs);
      }
    } catch (err) {
      console.error("Erreur utilisateurs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTrajets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/employe/trajets");
      if (data.success) {
        setTrajets(data.trajets);
      }
    } catch (err) {
      console.error("Erreur trajets:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/employe/support");
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Erreur tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour modifier un utilisateur
  const modifierUtilisateur = async (userId, modifications) => {
    try {
      const data = await apiFetch(`/employe/utilisateurs/${userId}`, {
        method: "PUT",
        body: JSON.stringify(modifications)
      });

      if (data.success) {
        alert(data.message);
        loadUtilisateurs(); // Recharger
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      console.error("Erreur modification:", err);
      alert("Erreur lors de la modification");
    }
  };

  // Fonction pour modérer un trajet
  const modererTrajet = async (trajetId, statut, motif) => {
    try {
      const data = await apiFetch(`/employe/trajets/${trajetId}/moderate`, {
        method: "PUT",
        body: JSON.stringify({ statut, motif })
      });

      if (data.success) {
        alert(data.message);
        loadTrajets(); // Recharger
      } else {
        alert(data.message || "Erreur");
      }
    } catch (err) {
      console.error("Erreur modération:", err);
      alert("Erreur lors de la modération");
    }
  };

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 Espace Employé
        </h1>
        <p className="text-gray-600">
          Gestion de la plateforme EcoRide
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'utilisateurs', label: '👥 Utilisateurs', icon: '👥' },
              { id: 'trajets', label: '🚗 Trajets', icon: '🚗' },
              { id: 'support', label: '🎫 Support', icon: '🎫' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu selon l'onglet */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      ) : (
        <div>

          {/* 📊 DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <DashboardTab stats={stats} />
          )}

          {/* 👥 UTILISATEURS */}
          {activeTab === 'utilisateurs' && (
            <UtilisateursTab
              utilisateurs={utilisateurs}
              onModifier={modifierUtilisateur}
            />
          )}

          {/* 🚗 TRAJETS */}
          {activeTab === 'trajets' && (
            <TrajetsTab
              trajets={trajets}
              onModerer={modererTrajet}
            />
          )}

          {/* 🎫 SUPPORT */}
          {activeTab === 'support' && (
            <SupportTab tickets={tickets} />
          )}
        </div>
      )}

    </div>
  );
}

// ────────────────────────────────────────────────────────
// COMPOSANT DASHBOARD
// ────────────────────────────────────────────────────────
function DashboardTab({ stats }) {
  const { general, revenus_mensuels, top_conducteurs } = stats;

  return (
    <div className="space-y-8">

      {/* Stats générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Utilisateurs"
          value={general.total_utilisateurs}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Conducteurs"
          value={general.total_conducteurs}
          icon="🚗"
          color="green"
        />
        <StatCard
          title="Trajets Actifs"
          value={`${general.trajets_actifs}/${general.total_trajets}`}
          icon="🛣️"
          color="orange"
        />
        <StatCard
          title="Crédits en Circulation"
          value={`${parseFloat(general.credits_circulation).toFixed(0)}€`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Revenus mensuels */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Revenus Mensuels</h3>
        <div className="space-y-2">
          {revenus_mensuels.map((mois, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>{new Date(mois.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
              <span className="font-semibold text-green-600">{parseFloat(mois.revenus).toFixed(2)}€</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top conducteurs */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 Top Conducteurs</h3>
        <div className="space-y-3">
          {top_conducteurs.map((conducteur, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{conducteur.prenom} {conducteur.nom}</span>
                <span className="text-sm text-gray-600 ml-2">({conducteur.nb_trajets} trajets)</span>
              </div>
              <span className="font-semibold text-brand-600">{parseFloat(conducteur.revenus_total).toFixed(2)}€</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Composant StatCard
function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`${colors[color]} rounded-full p-3 text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// COMPOSANT UTILISATEURS  
// ────────────────────────────────────────────────────────
function UtilisateursTab({ utilisateurs, onModifier }) {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">👥 Gestion des Utilisateurs</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {utilisateurs.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {parseRoles(user.roles).map(role => (
                      <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-600">
                    {parseFloat(user.credits || 0).toFixed(2)}€
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.nb_trajets_conducteur} trajets •{' '}
                  {user.nb_reservations_passager} réservations
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="text-brand-600 hover:text-brand-800 font-medium text-sm"
                  >
                    ⚙️ Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de modification */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={onModifier}
        />
      )}
    </div>
  );
}

// Modal de modification utilisateur
function UserEditModal({ user, onClose, onSave }) {
  const [roles, setRoles] = useState(parseRoles(user.roles));
  const [credits, setCredits] = useState(user.credits);
  const [creditAmount, setCreditAmount] = useState('');

  const handleSave = () => {
    const modifications = {};

    const currentRoles = JSON.stringify(parseRoles(user.roles));
    const newRoles = JSON.stringify(roles);
    if (currentRoles !== newRoles) {
      modifications.roles = roles;
    }

    if (parseFloat(credits) !== parseFloat(user.credits)) {
      modifications.credits = parseFloat(credits);
    }

    onSave(user.id, modifications);
    onClose();
  };

  const handleCredit = async () => {
    if (creditAmount && parseFloat(creditAmount) > 0) {
      try {
        // Appel API pour créditer réellement en BDD
        const data = await apiFetch(`/employe/utilisateurs/${user.id}/crediter`, {
          method: "POST",
          body: JSON.stringify({
            montant: parseFloat(creditAmount),
            motif: "Crédit employé"
          })
        });

        if (data.success) {
          // Met à jour le state local SEULEMENT si ça a marché en BDD
          setCredits(parseFloat(credits) + parseFloat(creditAmount));
          setCreditAmount('');
          alert(`${creditAmount}€ crédités avec succès !`);
        } else {
          alert("Erreur lors du crédit: " + data.message);
        }
      } catch (err) {
        console.error("Erreur crédit:", err);
        alert("Erreur réseau lors du crédit");
      }
    }
  };

  const toggleRole = (role) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Modifier {user.prenom} {user.nom}
        </h3>

        {/* Gestion des rôles */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rôles</label>
          <div className="space-y-2">
            {['passager', 'conducteur', 'employe'].map(role => (
              <label key={role} className="flex items-center">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="mr-2"
                />
                <span className="capitalize">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Gestion des crédits */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Crédits actuels: {parseFloat(credits).toFixed(2)}€
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Montant à ajouter"
              className="flex-1 border border-gray-300 rounded px-3 py-1"
            />
            <button
              onClick={handleCredit}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              + Créditer
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// COMPOSANT TRAJETS
// ────────────────────────────────────────────────────────
function TrajetsTab({ trajets, onModerer }) {
  const [selectedTrajet, setSelectedTrajet] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">🚗 Gestion des Trajets</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trajet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conducteur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réservations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trajets.map(trajet => (
              <tr key={trajet.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {trajet.depart} → {trajet.arrivee}
                  </div>
                  <div className="text-sm text-gray-600">{trajet.prix}€</div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {trajet.conducteur_prenom} {trajet.conducteur_nom}
                    </div>
                    <div className="text-sm text-gray-600">{trajet.conducteur_email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(trajet.date_depart).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${trajet.statut === 'actif' ? 'bg-green-100 text-green-800' :
                    trajet.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                      trajet.statut === 'termine' ? 'bg-gray-100 text-gray-800' :
                        trajet.statut === 'suspendu' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                    }`}>
                    {trajet.statut}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {trajet.places_reservees}/{trajet.places} places
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedTrajet(trajet)}
                    className="text-brand-600 hover:text-brand-800 font-medium text-sm"
                  >
                    ⚖️ Modérer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de modération */}
      {selectedTrajet && (
        <TrajetModerationModal
          trajet={selectedTrajet}
          onClose={() => setSelectedTrajet(null)}
          onModerate={onModerer}
        />
      )}
    </div>
  );
}

// Modal de modération trajet
function TrajetModerationModal({ trajet, onClose, onModerate }) {
  const [statut, setStatut] = useState(trajet.statut);
  const [motif, setMotif] = useState('');

  const handleModerate = () => {
    if (statut !== trajet.statut) {
      onModerate(trajet.id, statut, motif || `Changé de ${trajet.statut} vers ${statut}`);
      onClose();
    } else {
      alert("Aucune modification détectée");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Modérer le trajet {trajet.depart} → {trajet.arrivee}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau statut</label>
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="actif">Actif</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
            <option value="annule">Annulé</option>
            <option value="suspendu">Suspendu (modération)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Motif (optionnel)</label>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Raison de la modération..."
            rows="3"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleModerate}
            className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Modérer
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// COMPOSANT SUPPORT
// ────────────────────────────────────────────────────────
function SupportTab({ tickets }) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">🎫 Support Tickets</h3>
      </div>

      <div className="space-y-4 p-6">
        {tickets.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Aucun ticket de support</p>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{ticket.sujet}</h4>
                <span className={`px-2 py-1 rounded text-xs ${ticket.statut === 'open' ? 'bg-red-100 text-red-800' :
                  ticket.statut === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                  {ticket.statut}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
              <div className="text-xs text-gray-500">
                Par {ticket.user_email} • {new Date(ticket.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}