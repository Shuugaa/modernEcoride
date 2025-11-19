// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "./layouts/Layout";

import Home from "./pages/Home";
import Recherche from "./pages/Recherche";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";

import Trajets from "./pages/Trajets";
import TrajetsAdd from "./pages/TrajetsAdd";
import TrajetsList from "./pages/TrajetsList";
import TrajetsDetails from "./pages/TrajetsDetails";

import Reservations from "./pages/Reservations";
import RechargeCredits from "./pages/RechargeCredits";

import DashboardRedirect from "./components/DashboardRedirect";
import PrivateRoute from "./components/PrivateRoute";

// (bientôt) pages dashboards internes
// import AdminModule from "./pages/dashboard/AdminModule";
// import EmployeModule from "./pages/dashboard/EmployeModule";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>

        {/* --- PUBLIC --- */}
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* --- DASHBOARD UNIQUE (redirige selon les rôles) --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRedirect />
            </PrivateRoute>
          }
        />

        {/* --- TRAJETS --- */}
        <Route
          path="/trajets"
          element={
            <PrivateRoute role="conducteur">
              <Trajets />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/new"
          element={
            <PrivateRoute role="conducteur">
              <TrajetsAdd />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/list"
          element={
            <PrivateRoute role="conducteur">
              <TrajetsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/details/:trajetId"
          element={
            <PrivateRoute>
              <TrajetsDetails />
            </PrivateRoute>
          }
        />

        {/* --- RÉSERVATIONS --- */}
        <Route
          path="/reservations/:trajetId"
          element={
            <PrivateRoute role="passager">
              <Reservations />
            </PrivateRoute>
          }
        />

        {/* --- PAGE "mes réservations" → dashboard passager --- */}
        <Route
          path="/reservations/mine"
          element={
            <PrivateRoute role="passager">
              <DashboardRedirect />
            </PrivateRoute>
          }
        />


        {/* Conducteur */}
        <Route
          path="/dashboard/conducteur"
          element={<PrivateRoute role="conducteur"><DashboardConducteur /></PrivateRoute>}
        />
        <Route
          path="/dashboard/conducteur/mes-trajets"
          element={<PrivateRoute role="conducteur"><MesTrajets /></PrivateRoute>}
        />
        <Route
          path="/dashboard/conducteur/nouveau"
          element={<PrivateRoute role="conducteur"><NouveauTrajet /></PrivateRoute>}
        />

        {/* Passager */}
        <Route
          path="/dashboard/passager"
          element={<PrivateRoute role="passager"><DashboardPassager /></PrivateRoute>}
        />

        {/* --- CREDITS --- */}
        <Route
          path="/credits"
          element={
            <PrivateRoute>
              <RechargeCredits />
            </PrivateRoute>
          }
        />

      </Route>
    </Routes>
  );
}