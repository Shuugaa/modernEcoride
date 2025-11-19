import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col gap-16">

      {/* HERO */}
      <section className="bg-white p-10 rounded-xl shadow-md border border-brand-light">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Bienvenue sur <span className="text-green-600">EcoRide</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Le covoiturage écologique qui vous fait économiser tout en préservant la planète 🌱
        </p>

        <p className="text-lg text-gray-700 max-w-2xl mb-6">
          Réduisez votre empreinte carbone, partagez vos trajets et rencontrez des conducteurs et passagers
          proches de chez vous. Simple, écologique et économique.
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            to="/recherche"
            className="bg-brand-dark hover:bg-brand-verydark text-white px-5 py-3 rounded-lg font-semibold transition"
          >
            Rechercher un trajet
          </Link>

          <Link
            to="/register"
            className="bg-brand-light hover:bg-brand-dark text-brand-verydark hover:text-white px-5 py-3 rounded-lg font-semibold transition border border-brand-dark"
          >
            Rejoindre la communauté
          </Link>
        </div>
      </section>

      {/* AVANTAGES */}
      <section>
        <h2 className="text-3xl font-bold text-brand-verydark mb-6">
          Pourquoi choisir Carpool Nature ?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow-md border border-brand-light">
            <h3 className="text-xl font-semibold text-brand-dark mb-2">🌍 Écologique</h3>
            <p className="text-gray-700">
              Réduisez les émissions grâce au partage de trajets. Chaque covoiturage compte !
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-brand-light">
            <h3 className="text-xl font-semibold text-brand-dark mb-2">💸 Économique</h3>
            <p className="text-gray-700">
              Divisez vos frais de route et faites des économies au quotidien.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-brand-light">
            <h3 className="text-xl font-semibold text-brand-dark mb-2">🤝 Communautaire</h3>
            <p className="text-gray-700">
              Rencontrez des passagers ou conducteurs partageant vos trajets et vos valeurs.
            </p>
          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center bg-brand-light p-10 rounded-xl shadow-md border border-brand-dark">
        <h2 className="text-3xl font-bold text-brand-verydark mb-4">
          Prêt à prendre la route ? 🌱
        </h2>

        <Link
          to="/register"
          className="bg-brand-dark hover:bg-brand-verydark text-white px-6 py-3 rounded-lg text-lg font-semibold"
        >
          Créer un compte
        </Link>
      </section>

    </div>
  );
}
