import { Link } from "react-router-dom";

export default function RechercheShortcut() {
  return (
    <div className="text-center mt-6">
      <Link
        to="/recherche"
        className="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700"
      >
        🔍 Rechercher un trajet
      </Link>
    </div>
  );
}
