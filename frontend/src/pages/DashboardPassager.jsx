// src/pages/DashboardPassager.jsx
import { useUser } from "../context/UserContext";

export default function DashboardPassager() {
  const { user } = useUser();

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-brand-dark mb-6">
        🧍 Tableau de bord passager
      </h1>

      <p className="text-gray-600 mb-8">
        Bonjour <strong>{user.prenom}</strong> !  
        Prêt pour un nouveau covoiturage ? 🌍
      </p>

      {/* SECTION : Recherche rapide */}
      <div className="bg-white p-5 rounded-xl shadow border border-brand-light mb-10">
        <h2 className="text-xl font-semibold text-brand-dark mb-3">🔍 Recherche rapide</h2>

        <p className="text-gray-600 mb-3">Retrouvez facilement un trajet.</p>

        <a
          href="/recherche"
          className="block bg-green-600 text-white text-center py-2 rounded hover:bg-green-700"
        >
          Rechercher un trajet
        </a>
      </div>

      {/* SECTION : Trajets réservés */}
      <div className="bg-white p-5 rounded-xl shadow border border-brand-light mb-10">
        <h2 className="text-xl font-semibold text-brand-dark mb-3">
          📝 Mes trajets réservés
        </h2>

        <p className="text-gray-600">
          Cette section affichera vos trajets réservés une fois la fonctionnalité activée.
        </p>
      </div>

      {/* SECTION : Statistiques */}
      <div className="bg-white p-5 rounded-xl shadow border border-brand-light">
        <h2 className="text-xl font-semibold text-brand-dark mb-3">
          📊 Statistiques
        </h2>
        <ul className="text-gray-700 list-disc list-inside">
          <li>0 trajets réalisés</li>
          <li>0 kg de CO₂ économisés 🌿</li>
        </ul>
      </div>

    </div>
  );
}
