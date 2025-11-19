// src/App.jsx
import { Routes, Route } from "react-router-dom";

import { UserProvider } from "./context/UserContext";
import PrivateRoute from "./components/PrivateRoute";
import DashboardRedirect from "./components/DashboardRedirect";

import Layout from "./layouts/Layout";

// Pages publiques
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recherche from "./pages/Recherche";
import About from "./pages/About";

// Dashboard container pro
import DashboardMain from "./pages/dashboard/DashboardMain";

// Modules pro
import AdminModule from "./pages/dashboard/admin/AdminModule";
import EmployeModule from "./pages/dashboard/employe/EmployeModule";

// Pages conducteur
import ConducteurIndex from "./pages/dashboard/conducteur/index";
import MesTrajets from "./pages/dashboard/conducteur/MesTrajets";
import NouveauTrajet from "./pages/dashboard/conducteur/NouveauTrajet";
import TrajetsReservations from "./pages/dashboard/conducteur/TrajetsReservations";

// Pages passager
import PassagerIndex from "./pages/dashboard/passager/index";
import HistoriqueTrajets from "./pages/dashboard/passager/HistoriqueTrajets";
import ReservationEnCours from "./pages/dashboard/passager/ReservationEnCours";
import RechercheShortcut from "./pages/dashboard/passager/RechercheShortcut";

import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route element={<Layout />}>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recherche" element={<Recherche />} />
          <Route path="/about" element={<About />} />

          {/* Redirection role → dashboard */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardRedirect />
              </PrivateRoute>
            }
          />

          {/* Dashboard avec layout */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardMain />
              </PrivateRoute>
            }
          >
            {/* Routes enfants du dashboard */}
            <Route path="conducteur" element={<ConducteurIndex />} />
            <Route path="conducteur/mes-trajets" element={<MesTrajets />} />
            <Route path="conducteur/nouveau" element={<NouveauTrajet />} />
            <Route path="conducteur/reservations" element={<TrajetsReservations />} />

            <Route path="passager" element={<PassagerIndex />} />
            <Route path="passager/en-cours" element={<ReservationEnCours />} />
            <Route path="passager/historique" element={<HistoriqueTrajets />} />
            <Route path="passager/recherche" element={<RechercheShortcut />} />

            <Route path="admin" element={<AdminModule />} />
            <Route path="employe" element={<EmployeModule />} />
          </Route>

          {/* Erreurs */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>

      </Routes>
    </UserProvider>
  );
}