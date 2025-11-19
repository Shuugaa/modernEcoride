import { useState } from "react";
import { apiFetch } from "../../../api/apiClient";

export default function CreateEmployee() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    roles: ["employe"]
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
      setError("Tous les champs sont requis");
      setLoading(false);
      return;
    }

    if (formData.roles.length === 0) {
      setError("Au moins un rôle doit être sélectionné");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/admin/create-employee", {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (data.success) {
        setMessage(`Utilisateur ${formData.prenom} ${formData.nom} créé avec succès !`);
        
        // Reset form
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          password: "",
          roles: ["employe"]
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = [
    { id: 'employe', label: 'Employé', description: 'Accès aux outils de gestion' },
    { id: 'conducteur', label: 'Conducteur', description: 'Peut créer des trajets' },
    { id: 'passager', label: 'Passager', description: 'Peut réserver des trajets' },
    { id: 'administrateur', label: 'Administrateur', description: 'Accès complet au système' }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Créer un Nouvel Utilisateur</h2>
        <p className="text-gray-600">
          Créez un compte avec des rôles spéciaux (employé, administrateur, etc.)
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
        
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: Marie"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Ex: Dupont"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Ex: marie.dupont@entreprise.com"
            required
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe temporaire *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Minimum 6 caractères"
            minLength={6}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            L'utilisateur devra changer ce mot de passe lors de sa première connexion.
          </p>
        </div>

        {/* Sélection des rôles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Rôles * (sélectionnez un ou plusieurs)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableRoles.map(role => (
              <div
                key={role.id}
                onClick={() => handleRoleToggle(role.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.roles.includes(role.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 ${
                    formData.roles.includes(role.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.roles.includes(role.id) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aperçu des rôles sélectionnés */}
        {formData.roles.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Rôles sélectionnés :</h4>
            <div className="flex flex-wrap gap-2">
              {formData.roles.map(roleId => {
                const role = availableRoles.find(r => r.id === roleId);
                return (
                  <span 
                    key={roleId}
                    className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {role?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Création..." : "Créer l'utilisateur"}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                nom: "",
                prenom: "",
                email: "",
                password: "",
                roles: ["employe"]
              });
              setMessage("");
              setError("");
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}