import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../../api/apiClient';

const ModifierVehicule = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    immatriculation: '',
    places: 4
  });
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [errors, setErrors] = useState({});

  const marques = [
    'Peugeot', 'Renault', 'Citroën', 'Volkswagen', 'Toyota', 'Ford',
    'BMW', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Autre'
  ];

  // Charger les données du véhicule à modifier
  useEffect(() => {
    loadVehicule();
  }, [id]);

  const loadVehicule = async () => {
    try {
      setLoadingInit(true);
      const response = await apiFetch('/api/vehicules');
      
      if (response.success) {
        const vehicule = response.vehicules.find(v => v.id === parseInt(id));
        
        if (vehicule) {
          setFormData({
            marque: vehicule.marque,
            modele: vehicule.modele,
            immatriculation: vehicule.immatriculation,
            places: vehicule.places
          });
        } else {
          setErrors({ submit: 'Véhicule non trouvé' });
        }
      }
    } catch (err) {
      setErrors({ submit: 'Erreur lors du chargement: ' + err.message });
    } finally {
      setLoadingInit(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'places' ? parseInt(value) : value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.marque.trim()) {
      newErrors.marque = 'La marque est obligatoire';
    }

    if (!formData.modele.trim()) {
      newErrors.modele = 'Le modèle est obligatoire';
    }

    if (!formData.immatriculation.trim()) {
      newErrors.immatriculation = 'L\'immatriculation est obligatoire';
    } else if (!/^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(formData.immatriculation.toUpperCase())) {
      newErrors.immatriculation = 'Format attendu: AB-123-CD';
    }

    if (formData.places < 2 || formData.places > 8) {
      newErrors.places = 'Le nombre de places doit être entre 2 et 8';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`/api/vehicules/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          immatriculation: formData.immatriculation.toUpperCase()
        })
      });

      if (response.success) {
        navigate('/dashboard/conducteur/vehicules', {
          state: { message: 'Véhicule modifié avec succès !' }
        });
      } else {
        setErrors({ submit: response.message || 'Erreur lors de la modification' });
      }
    } catch (err) {
      setErrors({ submit: 'Erreur: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  // Loading initial
  if (loadingInit) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du véhicule...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✏️ Modifier le véhicule
        </h1>
        <p className="text-gray-600">
          Modifiez les informations de votre véhicule
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Marque */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marque *
            </label>
            <select
              name="marque"
              value={formData.marque}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.marque ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Sélectionnez une marque</option>
              {marques.map(marque => (
                <option key={marque} value={marque}>{marque}</option>
              ))}
            </select>
            {errors.marque && (
              <p className="mt-1 text-sm text-red-600">{errors.marque}</p>
            )}
          </div>

          {/* Modèle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle *
            </label>
            <input
              type="text"
              name="modele"
              value={formData.modele}
              onChange={handleChange}
              placeholder="ex: 208, Clio, Golf..."
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.modele ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.modele && (
              <p className="mt-1 text-sm text-red-600">{errors.modele}</p>
            )}
          </div>

          {/* Immatriculation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immatriculation *
            </label>
            <input
              type="text"
              name="immatriculation"
              value={formData.immatriculation}
              onChange={handleChange}
              placeholder="AB-123-CD"
              maxLength="9"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
                errors.immatriculation ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.immatriculation && (
              <p className="mt-1 text-sm text-red-600">{errors.immatriculation}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Format français : 2 lettres - 3 chiffres - 2 lettres
            </p>
          </div>

          {/* Nombre de places */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de places *
            </label>
            <select
              name="places"
              value={formData.places}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.places ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              {[2, 3, 4, 5, 6, 7, 8].map(nb => (
                <option key={nb} value={nb}>
                  {nb} places {nb === 4 ? '(standard)' : ''}
                </option>
              ))}
            </select>
            {errors.places && (
              <p className="mt-1 text-sm text-red-600">{errors.places}</p>
            )}
          </div>

          {/* Erreur générale */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/conducteur/vehicules')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Modification en cours...' : 'Modifier le véhicule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierVehicule;