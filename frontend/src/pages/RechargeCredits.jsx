import { useState } from "react";
import { apiFetch } from "../api/apiClient";
import { useUser } from "../context/UserContext";

export default function RechargeCredits() {
  const { user, setUser } = useUser();
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState("");

  const recharge = async () => {
    try {
      const res = await apiFetch("/credits/add", {
        method: "POST",
        body: JSON.stringify({ amount })
      });

      setUser({ ...user, credits: res.credits });
      setMessage("Crédits ajoutés !");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg border">

      <h1 className="text-2xl font-bold mb-4">Recharger mes crédits</h1>
      <p className="text-gray-600 mb-4">
        Solde actuel : <strong>{user.credits} crédits</strong>
      </p>

      <label className="font-semibold">Montant</label>
      <input
        type="number"
        className="border p-2 rounded w-full mb-4"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
      />

      <button
        onClick={recharge}
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
      >
        Ajouter
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
