import { useState } from "react";

export default function Recherche() {
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [trajets, setTrajets] = useState([]);

  const search = async () => {
    const res = await fetch(
      `http://localhost:5000/trajets/search?depart=${depart}&arrivee=${arrivee}`
    );
    const data = await res.json();
    setTrajets(data.trajets || []);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rechercher un trajet</h2>

      <div className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Départ"
          value={depart}
          onChange={(e) => setDepart(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Arrivée"
          value={arrivee}
          onChange={(e) => setArrivee(e.target.value)}
        />

        <button
          onClick={search}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Rechercher
        </button>
      </div>

      <div className="mt-6">
        {trajets.length === 0 && <p>Aucun résultat pour le moment.</p>}

        {trajets.map((t) => (
          <div key={t.id} className="border p-3 rounded mb-3 shadow">
            <p><strong>{t.depart} → {t.arrivee}</strong></p>
            <p>Date : {new Date(t.date_depart).toLocaleDateString()}</p>
            <p>Conducteur : {t.conducteur_id}</p>
            <p>Places disponibles : {t.places_disponibles}</p>
            <p>Prix : {t.prix} €</p>
            <a href={`/reservations/${t.id}`} className="text-blue-600 underline">Voir les détails</a>
          </div>
        ))}
      </div>
    </div>
  );
}
