import { useState, useEffect } from "react";
import { apiFetch } from "../../../api/apiClient";
import { useUser } from "../../../context/UserContext";

export default function AdminUsers() {
  const { user } = useUser(); // Import depuis UserContext
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/users");

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modifier les rôles d'un utilisateur
  const updateUserRoles = async (userId, newRoles) => {
    try {

      const data = await apiFetch(`/admin/users/${userId}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles: newRoles })
      });

      if (data.success) {
        // Mettre à jour l'utilisateur dans la liste
        setUsers(prev => prev.map(u =>
          u.id === userId
            ? { ...u, roles: newRoles }
            : u
        ));
        setEditingUser(null);
        alert("Rôles modifiés avec succès !"); // Feedback
      } else {
        setError(data.message || "Erreur lors de la modification");
        alert("Erreur: " + (data.message || "Modification échouée"));
      }
    } catch (err) {
      console.error("Erreur modification rôles:", err);
      setError("Erreur: " + err.message);
      alert("Erreur réseau: " + err.message);
    }
  };

  // Désactiver un utilisateur
  const toggleUserActive = async (userId, currentActive) => {
    const action = currentActive ? "désactiver" : "réactiver";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
      return;
    }

    try {
      const data = await apiFetch(`/admin/users/${userId}/toggle-active`, {
        method: "PATCH",
        body: JSON.stringify({ active: !currentActive })
      });

      if (data.success) {
        // Mettre à jour le statut
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? { ...user, active: !currentActive }
            : user
        ));
        alert(`Utilisateur ${!currentActive ? 'réactivé' : 'désactivé'} avec succès !`);
      } else {
        setError(data.message);
        alert("Erreur: " + data.message);
      }
    } catch (err) {
      setError(err.message);
      alert("Erreur réseau: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des utilisateurs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <div className="text-sm text-gray-500">
          {users.length} utilisateur{users.length > 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Crédits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id} className={!user.active ? "bg-gray-50 opacity-60" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-sm text-gray-500">ID: {user.id}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    {editingUser === user.id ? (
                      <RoleEditor
                        currentRoles={Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]')}  // ✅ Parse si nécessaire
                        onSave={(newRoles) => updateUserRoles(user.id, newRoles)}
                        onCancel={() => setEditingUser(null)}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(user.roles) ? user.roles : JSON.parse(user.roles || '[]')).map(role => (
                          <span
                            key={role}
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleColor(role)}`}
                          >
                            {getRoleLabel(role)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.credits}€</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${user.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {user.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {editingUser === user.id ? null : (
                      <>
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-brand-dark hover:text-blue-900"
                        >
                          Modifier rôles
                        </button>

                        {/* ✅ BOUTON TOGGLE (Désactiver/Réactiver) */}
                        <button
                          onClick={() => toggleUserActive(user.id, user.active)}
                          className={`${user.active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                            }`}
                        >
                          {user.active ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Composant pour éditer les rôles
function RoleEditor({ currentRoles, onSave, onCancel }) {
  const [selectedRoles, setSelectedRoles] = useState(currentRoles);

  const availableRoles = [
    'passager',
    'conducteur',
    'employe',
    'administrateur'
  ];

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {availableRoles.map(role => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={`px-2 py-1 text-xs rounded border ${selectedRoles.includes(role)
              ? 'bg-brand-light border-blue-300 text-brand-verydark'
              : 'bg-gray-100 border-gray-300 text-gray-600'
              }`}
          >
            {getRoleLabel(role)}
          </button>
        ))}
      </div>
      <div className="space-x-2">
        <button
          onClick={() => onSave(selectedRoles)}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          Sauver
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

// Helpers
function getRoleColor(role) {
  switch (role) {
    case 'administrateur': return 'bg-red-100 text-red-800';
    case 'employe': return 'bg-purple-100 text-purple-800';
    case 'conducteur': return 'bg-brand-light text-brand-verydark';
    case 'passager': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getRoleLabel(role) {
  switch (role) {
    case 'administrateur': return 'Admin';
    case 'employe': return 'Employé';
    case 'conducteur': return 'Conducteur';
    case 'passager': return 'Passager';
    default: return role;
  }
}