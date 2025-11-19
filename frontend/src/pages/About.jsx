import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            À propos de <span className="text-brand-dark">EcoRide</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plateforme moderne de covoiturage qui connecte conducteurs et passagers 
            pour des trajets économiques et écologiques.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚗</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Trajets Flexibles</h3>
            <p className="text-gray-600">
              Trouvez ou proposez des trajets selon vos horaires et destinations préférées.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Économique</h3>
            <p className="text-gray-600">
              Partagez les frais de carburant et réduisez vos coûts de transport significativement.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Écologique</h3>
            <p className="text-gray-600">
              Réduisez votre empreinte carbone en optimisant l'utilisation des véhicules.
            </p>
          </div>

        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-brand-dark to-brand-verydark rounded-xl text-white p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">EcoRide en chiffres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            <div>
              <div className="text-3xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Utilisateurs actifs</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold mb-2">450+</div>
              <div className="text-blue-100">Trajets réalisés</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold mb-2">15,000€</div>
              <div className="text-blue-100">Économies générées</div>
            </div>
            
            <div>
              <div className="text-3xl font-bold mb-2">25 tonnes</div>
              <div className="text-blue-100">CO₂ évité</div>
            </div>

          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center">
              <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-dark">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Inscrivez-vous</h3>
              <p className="text-gray-600">
                Créez votre compte en quelques minutes et choisissez votre profil : conducteur, passager ou les deux !
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Trouvez ou proposez</h3>
              <p className="text-gray-600">
                Recherchez des trajets disponibles ou publiez le vôtre avec vos horaires et votre itinéraire.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Voyagez ensemble</h3>
              <p className="text-gray-600">
                Confirmez votre réservation, rencontrez-vous au point de départ et profitez du voyage !
              </p>
            </div>

          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-gray-600 mb-6">
            Rejoignez notre communauté de voyageurs responsables dès aujourd'hui.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="px-8 py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-verydark transition font-medium"
            >
              🚀 S'inscrire gratuitement
            </Link>
            <Link 
              to="/recherche"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              🔍 Voir les trajets
            </Link>
          </div>
        </div>

        {/* Tech Stack (pour ton examen) */}
        <div className="mt-16 bg-gray-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Technologies utilisées
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">⚛️</div>
              <div className="font-medium">React</div>
              <div className="text-sm text-gray-600">Frontend</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🟢</div>
              <div className="font-medium">Node.js</div>
              <div className="text-sm text-gray-600">Backend</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🐘</div>
              <div className="font-medium">PostgreSQL</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">Tailwind</div>
              <div className="text-sm text-gray-600">Styling</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}