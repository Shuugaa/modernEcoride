// src/pages/dashboard/DashboardMain.jsx
import { useUser } from "../../context/UserContext";
import { Link } from "react-router-dom";

export default function DashboardMain() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        👋 Bonjour {user.prenom} !
      </h1>

      <p className="mb-4 text-gray-700">
        Vous disposez des rôles suivants :
      </p>

      <ul className="mb-6">
        {user.roles.map(r => (
          <li key={r} className="text-lg">• {r}</li>
        ))}
      </ul>

      <h2 className="text-2xl font-semibold mb-4">Accéder à vos espaces :</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {user.roles.includes("conducteur") && (
          <Link className="p-4 bg-white rounded shadow" to="/dashboard/conducteur">
            🚗 Espace Conducteur
          </Link>
        )}

        {user.roles.includes("passager") && (
          <Link className="p-4 bg-white rounded shadow" to="/dashboard/passager">
            🎒 Espace Passager
          </Link>
        )}

        {user.roles.includes("employe") && (
          <Link className="p-4 bg-white rounded shadow" to="/dashboard/employe">
            🏢 Espace Employé
          </Link>
        )}

        {user.roles.includes("admin") && (
          <Link className="p-4 bg-white rounded shadow" to="/dashboard/admin">
            🛠️ Espace Admin
          </Link>
        )}

      </div>
    </div>
  );
}
