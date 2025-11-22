import React, { useEffect, useState } from "react";
import apiFetch from "../../../api/apiClient";

const Profil = () => {
    const [user, setUser] = useState(null);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        apiFetch("/user/profile")
            .then(res => {
                setUser(res.user || res);
                setForm(res.user || res);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        apiFetch("/user/profile", {
            method: "PUT",
            body: JSON.stringify(form)
        })
            .then(res => {
                setUser(res.user || res);
                setEdit(false);
            })
            .catch(err => {
                console.error(err);
            });
    };

    if (!user) return <div className="text-center py-8">Chargement...</div>;

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Mon profil</h2>
            {!edit ? (
                <div className="space-y-4">
                    <p><span className="font-semibold">Nom :</span> {user.nom}</p>
                    <p><span className="font-semibold">Prénom :</span> {user.prenom}</p>
                    <p><span className="font-semibold">Email :</span> {user.email}</p>
                    <div className="text-center pt-4">
                        <button
                            onClick={() => setEdit(true)}
                            className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-verydark transition"
                        >
                            Modifier
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nom :</label>
                        <input
                            type="text"
                            name="nom"
                            value={form.nom || ""}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-brand-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Prénom :</label>
                        <input
                            type="text"
                            name="prenom"
                            value={form.prenom || ""}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-brand-dark"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email :</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:border-brand-dark"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="bg-brand-dark text-white px-6 py-2 rounded hover:bg-brand-verydark transition"
                        >
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            onClick={() => setEdit(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Profil;