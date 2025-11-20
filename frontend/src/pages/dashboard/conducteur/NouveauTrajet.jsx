// frontend/src/pages/dashboard/conducteur/NouveauTrajet.jsx
import { useState } from "react";
import apiFetch from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";

export default function NouveauTrajet() {
  const [form, setForm] = useState({
    depart: "",
    arrivee: "",
    date_depart: "",
    prix: "",
    places_disponibles: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function onChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        depart: form.depart,
        arrivee: form.arrivee,
        date_depart: form.date_depart,
        prix: parseFloat(form.prix),
        places_disponibles: parseInt(form.places_disponibles)
      };
      const res = await apiFetch("/conducteur/nouveau-trajet", {
        method: "POST",
        body: JSON.stringify(body),
      });
      // assume success
      navigate("/dashboard/conducteur/mes-trajets");
    } catch (err) {
      setError(err.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Créer un nouveau trajet</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="depart" value={form.depart} onChange={onChange} placeholder="Ville de départ" className="w-full border p-2 rounded" />
        <input name="arrivee" value={form.arrivee} onChange={onChange} placeholder="Ville d'arrivée" className="w-full border p-2 rounded" />
        <input type="datetime-local" name="date_depart" value={form.date_depart} onChange={onChange} className="w-full border p-2 rounded" />
        <input type="number" name="prix" value={form.prix} onChange={onChange} placeholder="Prix (crédits)" className="w-full border p-2 rounded" />
        <input type="number" name="places_disponibles" value={form.places_disponibles} onChange={onChange} placeholder="Places disponibles" className="w-full border p-2 rounded" />

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "Création..." : "Créer le trajet"}
          </button>
          <button type="button" onClick={() => { setForm({ depart: "", arrivee: "", date_depart: "", prix: "", places_disponibles: 1 }); }} className="px-4 py-2 border rounded">
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  );
}
