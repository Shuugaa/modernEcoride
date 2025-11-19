import { useUser } from "../../context/UserContext";
import ConducteurModule from "./modules/ConducteurModule";
import PassagerModule from "./modules/PassagerModule";
import EmployeModule from "./modules/EmployeModule";
import AdminModule from "./modules/AdminModule";

export default function Dashboard() {
  const { user, hasRole } = useUser();

  if (!user) return <p>Chargement...</p>;

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-brand-dark">
        Tableau de bord — {user.prenom}
      </h1>

      {/* ADMIN */}
      {hasRole("admin") && (
        <AdminModule />
      )}

      {/* EMPLOYÉ */}
      {hasRole("employe") && (
        <EmployeModule />
      )}

      {/* CONDUCTEUR */}
      {hasRole("conducteur") && (
        <ConducteurModule />
      )}

      {/* PASSAGER */}
      {hasRole("passager") && (
        <PassagerModule />
      )}

      {/* Si l'utilisateur n'a aucun rôle connu (rare) */}
      {!(
        hasRole("admin") ||
        hasRole("employe") ||
        hasRole("conducteur") ||
        hasRole("passager")
      ) && <p>Aucun module disponible pour votre rôle.</p>}
    </div>
  );
}
