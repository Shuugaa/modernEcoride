import React, { useState } from 'react';
import { apiFetch } from '../api/apiClient';

const TrajetsAdd = () => {
    const [form, setForm] = useState({
        depart: '',
        arrivee: '',
        date_depart: '',
        places_disponibles: '',
        prix: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await apiFetch("/trajets/add", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.success) {
                setMessage('Trajet ajouté avec succès!');
                setForm({ depart: '', arrivee: '', date_depart: '', places_disponibles: '', prix: '' });
            } else {
                setMessage('Erreur lors de l\'ajout du trajet.');
            }
        } catch (err) {
            setMessage('Erreur réseau.');
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center mt-10">
            <div className="bg-white rounded-lg shadow p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-brand-dark">Ajouter un trajet</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="depart" className="block mb-1 font-medium text-brand-dark">Départ</label>
                        <input
                            id="depart"
                            name="depart"
                            type="text"
                            value={form.depart}
                            onChange={handleChange}
                            required
                            className="w-full border border-brand-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="arrivee" className="block mb-1 font-medium text-brand-dark">Arrivée</label>
                        <input
                            id="arrivee"
                            name="arrivee"
                            type="text"
                            value={form.arrivee}
                            onChange={handleChange}
                            required
                            className="w-full border border-brand-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="date_depart" className="block mb-1 font-medium text-brand-dark">Date</label>
                        <input
                            id="date_depart"
                            name="date_depart"
                            type="date"
                            value={form.date_depart}
                            onChange={handleChange}
                            required
                            className="w-full border border-brand-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="places_disponibles" className="block mb-1 font-medium text-brand-dark">Places disponibles</label>
                        <input
                            id="places_disponibles"
                            name="places_disponibles"
                            type="number"
                            min="1"
                            step="1"
                            value={form.places_disponibles}
                            onChange={handleChange}
                            required
                            className="w-full border border-brand-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                        />
                    </div>
                    <div>
                        <label htmlFor="prix" className="block mb-1 font-medium text-brand-dark">Prix</label>
                        <input
                            id="prix"
                            name="prix"
                            type="numeric"
                            min="0"
                            step="0.01"
                            value={form.prix}
                            onChange={handleChange}
                            required
                            className="w-full border border-brand-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-dark"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-dark text-white py-2 rounded hover:bg-brand-light transition"
                    >
                        {loading ? "Ajout..." : "Ajouter"}
                    </button>
                </form>
                {message && (
                    <div className={`mt-4 p-3 rounded ${message.includes('succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrajetsAdd;