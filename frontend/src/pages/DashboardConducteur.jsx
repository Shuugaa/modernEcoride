// src/pages/DashboardConducteur.jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";
import { useUser } from "../context/UserContext";

export default function DashboardConducteur() {
  const { user } = useUser();
  const [vehicules, setVehicules] = useState([]);
  const [form, setForm] = useState({
    marque: "",
    modele: "",
    immatriculation: "",
    places: 4
  });
  const [loading, setLoading] = useState(true);

  // Charger les véhicules du conducteur
  useEffect(() => {
    async function loadVehicules() {
      try {
        const data = await apiFetch("/vehicules");
        if (data.success) setVehicules(data.vehicules);
      } catch (err) {
        console.error("Erreur chargement véhicules:", err);
      }
      setLoading(false);
    }
    loadVehicules();
  }, []);

  // Ajouter un véhicule
  async function addVehicule(e) {
    e.preventDefault();

    try {
      const data = await apiFetch("/vehicules", {
        method: "POST",
        body: JSON.stringify(form)
      });

      if (!data.success) {
        alert(data.message || "Erreur lors de l’ajout du véhicule");
        return;
      }

      // Ajouter en tête de liste
      setVehicules([data.vehicule, ...vehicules]);

      // Reset du formulaire
      setForm({
        marque: "",
        modele: "",
        immatriculation: "",
        places: 4
      });

    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-brand-dark mb-6">
        🚗 Tableau de bord conducteur
      </h1>

      <p className="text-gray-600 mb-8">
        Bienvenue <strong>{user?.prenom}</strong> !
        Voici vos véhicules enregistrés.
      </p>

      {/* FORMULAIRE AJOUT */}
      <form
        onSubmit={addVehicule}
        className="bg-white p-5 rounded-xl shadow border border-brand-light mb-10"
      >
        <h2 className="text-xl font-semibold text-brand-dark mb-4">
          Ajouter un véhicule
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Marque"
            value={form.marque}
            onChange={e => setForm({ ...form, marque: e.target.value })}
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Modèle"
            value={form.modele}
            onChange={e => setForm({ ...form, modele: e.target.value })}
            required
          />

          <input
            className="border p-2 rounded col-span-2"
            placeholder="Immatriculation"
            value={form.immatriculation}
            onChange={e => setForm({ ...form, immatriculation: e.target.value })}
            required
          />

          <input
            type="number"
            className="border p-2 rounded"
            min="1"
            max="9"
            value={form.places}
            onChange={e => setForm({ ...form, places: Number(e.target.value) })}
            required
          />
        </div>

        <button className="mt-4 bg-green-600 hover:bg-green-700 text-white p-2 rounded w-full">
          Ajouter
        </button>
      </form>

      {/* LISTE DES VÉHICULES */}
      <h2 className="text-xl font-semibold text-brand-dark mb-3">
        Vos véhicules
      </h2>

      {loading ? (
        <p>Chargement...</p>
      ) : vehicules.length === 0 ? (
        <p className="text-gray-600">Aucun véhicule enregistré.</p>
      ) : (
        <div className="space-y-4">
          {vehicules.map((v) => (
            <div
              key={v.id}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500"
            >
              <h3 className="text-lg font-bold">
                {v.marque} {v.modele}
              </h3>
              <p className="text-gray-600">
                Immatriculation : <strong>{v.immatriculation}</strong>
              </p>
              <p className="text-gray-600">
                Places : {v.places}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
