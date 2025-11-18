// src/App.jsx
import { Routes, Route } from "react-router-dom";

import Layout from "./layouts/Layout";

import Home from "./pages/Home";
import Recherche from "./pages/Recherche";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trajets from "./pages/Trajets";
import About from "./pages/About";

import TrajetsAdd from "./pages/TrajetsAdd";
import TrajetsList from "./pages/TrajetsList";
import TrajetsDetails from "./pages/TrajetsDetails";

import DashboardRedirect from "./components/DashboardRedirect";
import DashboardConducteur from "./pages/DashboardConducteur";
import DashboardPassager from "./pages/DashboardPassager";
import RechargeCredits from "./pages/RechargeCredits";

import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Routes>

      {/* Layout global */}
      <Route element={<Layout />}>

        {/* --- PUBLIC --- */}
        <Route path="/" element={<Home />} />
        <Route path="/recherche" element={<Recherche />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        {/* --- REDIRECTION SELON ROLE --- */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardRedirect />
            </PrivateRoute>
          }
        />

        {/* --- DASHBOARD CONDUCTEUR --- */}
        <Route
          path="/dashboard/conducteur"
          element={
            <PrivateRoute role="conducteur">
              <DashboardConducteur />
            </PrivateRoute>
          }
        />

        {/* --- DASHBOARD PASSAGER --- */}
        <Route
          path="/dashboard/passager"
          element={
            <PrivateRoute role="passager">
              <DashboardPassager />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets"
          element={
            <PrivateRoute>
              <Trajets />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/new"
          element={
            <PrivateRoute>
              <TrajetsAdd />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/list"
          element={
            <PrivateRoute>
              <TrajetsList />
            </PrivateRoute>
          }
        />

        <Route
          path="/trajets/details/:id"
          element={
            <PrivateRoute>
              <TrajetsDetails />
            </PrivateRoute>
          }
        />

        {/* --- RECHARGE DE CREDITS --- */}

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
