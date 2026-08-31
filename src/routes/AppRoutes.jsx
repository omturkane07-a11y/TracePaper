import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";

import Dashboard from "../pages/Dashboard";
import Investigations from "../pages/Investigations";
import InvestigationDetails from "../pages/InvestigationDetails";
import Analytics from "../pages/Analytics";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import AuditTrail from "../pages/AuditTrail";
import LeakDetection from "../pages/LeakDetection";
import Settings from "../pages/Settings";

import QuestionPaper from "../pages/QuestionPaper";
import WatermarkVerification from "../pages/WatermarkVerification";

import NotFound from "../pages/NotFound";

import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            ROOT
        ====================================================== */}

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* =====================================================
            AUTHENTICATION
        ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* =====================================================
            PROTECTED APPLICATION
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >

          {/* ===================================================
              DASHBOARD
          ==================================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ===================================================
              QUESTION PAPER
          ==================================================== */}

          <Route
            path="/question-paper"
            element={<QuestionPaper />}
          />

          {/* ===================================================
              WATERMARK VERIFICATION
          ==================================================== */}

          <Route
            path="/watermark-verification"
            element={<WatermarkVerification />}
          />

          {/* ===================================================
              INVESTIGATIONS
          ==================================================== */}

          <Route
            path="/investigations"
            element={<Investigations />}
          />

          <Route
            path="/investigations/:id"
            element={<InvestigationDetails />}
          />

          {/* ===================================================
              ANALYTICS
          ==================================================== */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* ===================================================
              REPORTS
          ==================================================== */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* ===================================================
              AUDIT TRAIL
          ==================================================== */}

          <Route
            path="/audit-trail"
            element={<AuditTrail />}
          />

          {/* ===================================================
              LEAK ALERTS
          ==================================================== */}

          <Route
            path="/leak-alerts"
            element={<LeakDetection />}
          />

          {/* ===================================================
              LEAK DETECTION
          ==================================================== */}

          <Route
            path="/leak-detection"
            element={<LeakDetection />}
          />

          {/* ===================================================
              USERS
          ==================================================== */}

          <Route
            path="/users"
            element={<Users />}
          />

          {/* ===================================================
              SETTINGS
          ==================================================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* =====================================================
            404
        ====================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}