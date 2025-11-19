import { useState } from "react";
import { apiFetch } from "../api/apiClient";
import { useUser } from "../context/UserContext";

export default function RechargeCredits() {
  const { user, setUser } = useUser();
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const recharge = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await apiFetch("/credits/add", {
        method: "POST",
        body: JSON.stringify({ amount })
      });

      if (res.success) {
        // Mettre à jour le context utilisateur
        setUser({ ...user, credits: res.credits });
        setMessage(`✅ ${amount} crédits ajoutés ! Nouveau solde : ${res.credits} crédits`);
        setAmount(50); // Reset
      } else {
        setMessage(`❌ ${res.message}`);
      }
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const montantsRapides = [20, 50, 100, 200];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">

        {/* Card principale */}
        <div className="bg-white rounded-xl shadow-lg p-6">

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              💰 Recharger mes crédits
            </h1>
            <div className="bg-brand-light p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Solde actuel</p>
              <p className="text-2xl font-bold text-brand-dark">
                {user?.credits || 0} ⚡
              </p>
            </div>
          </div>

          {/* Montants rapides */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Montants rapides
            </label>
            <div className="grid grid-cols-2 gap-2">
              {montantsRapides.map(montant => (
                <button
                  key={montant}
                  onClick={() => setAmount(montant)}
                  className={`p-3 rounded-lg border text-center transition ${amount === montant
                      ? 'border-brand-dark bg-brand-light text-brand-dark'
                      : 'border-gray-200 hover:border-brand-dark'
                    }`}
                >
                  <div className="font-semibold">{montant} ⚡</div>
                  <div className="text-xs text-gray-500">{montant}€</div>
                </button>
              ))}
            </div>
          </div>

          {/* Montant personnalisé */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant personnalisé
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-brand-dark focus:ring-1 focus:ring-brand-dark"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                placeholder="Entrez un montant"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ⚡
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Entre 1 et 1000 crédits
            </p>
          </div>

          {/* Bouton recharge */}
          <button
            onClick={recharge}
            disabled={loading || !amount || amount <= 0}
            className="w-full bg-brand-dark text-white py-3 rounded-lg font-semibold hover:bg-brand-verydark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Recharge en cours..." : `💳 Recharger ${amount} crédits`}
          </button>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes('✅')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}>
              {message}
            </div>
          )}

        </div>

        {/* Info */}
        <div className="mt-6 bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-2">ℹ️ Comment ça marche ?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 1 crédit = 1€ pour vos trajets</li>
            <li>• Rechargez selon vos besoins</li>
            <li>• Crédits disponibles immédiatement</li>
          </ul>
        </div>

      </div>
    </div>
  );
}