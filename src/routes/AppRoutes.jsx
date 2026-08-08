import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Investigations from "../pages/Investigations";
import InvestigationDetails from "../pages/InvestigationDetails";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import AuditTrail from "../pages/AuditTrail";
import LeakDetection from "../pages/LeakDetection";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";


export default function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Root URL routes to login as the first entry page */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Main Dashboard Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Investigations */}
          <Route
            path="/investigations"
            element={<Investigations />}
          />

          <Route
            path="/investigations/:id"
            element={<InvestigationDetails />}
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* Audit Trail */}
          <Route
            path="/audit-trail"
            element={<AuditTrail />}
          />

          {/* Leak Detection */}
          <Route
            path="/leak-detection"
            element={<LeakDetection />}
          />

          {/* Users */}
          <Route
            path="/users"
            element={<Users />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* Not Found */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>

  );

}