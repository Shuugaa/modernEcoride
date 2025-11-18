import React from 'react';
import { Link } from 'react-router-dom';

const Trajets = () => {
    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-brand-dark">Trajets</h1>
            <nav>
                <ul className="space-y-4">
                    <li>
                        <Link
                            to="/trajets/list"
                            className="block px-4 py-2 rounded bg-brand-light hover:bg-brand-dark text-brand-dark hover:text-white transition"
                        >
                            Liste des trajets
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/trajets/new"
                            className="block px-4 py-2 rounded bg-brand-light hover:bg-brand-dark text-brand-dark hover:text-white transition"
                        >
                            Ajouter un trajet
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/trajets/stats"
                            className="block px-4 py-2 rounded bg-brand-light hover:bg-brand-dark text-brand-dark hover:text-white transition"
                        >
                            Statistiques des trajets
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Trajets;