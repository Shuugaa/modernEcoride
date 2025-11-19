import ReservationsEnCours from "./ReservationsEnCours";
import HistoriqueTrajets from "./HistoriqueTrajets";
import RechercheShortcut from "./RechercheShortcut";

export default function DashboardPassager() {
  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold">Tableau de bord Passager</h1>

      {/* MODULE 1 : réservations actuelles */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Mes réservations en cours</h2>
        <ReservationsEnCours />
      </section>

      {/* MODULE 2 : historique */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Historique des trajets</h2>
        <HistoriqueTrajets />
      </section>

      {/* MODULE 3 : raccourci recherche */}
      <section>
        <RechercheShortcut />
      </section>

    </div>
  );
}
