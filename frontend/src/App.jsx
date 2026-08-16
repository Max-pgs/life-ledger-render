import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AddCommitmentPage from "./pages/AddCommitmentPage";
import CommitmentsPage from "./pages/CommitmentsPage";
import CommitmentDetailPage from "./pages/CommitmentDetailPage";
import DashboardLayout from "./layouts/DashboardLayout";
import EditCommitmentPage from "./pages/EditCommitmentPage";
import GuidesPage from "./pages/GuidesPage";
import GuidedSetupPage from "./pages/GuidedSetupPage";
import ForgottenChecklistPage from "./pages/ForgottenChecklistPage";
import SettingsPage from "./pages/SettingsPage";
import PremiumRoute from "./routes/PremiumRoute";
import FaqPage from "./pages/FaqPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/register" replace />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/commitments"
            element={<CommitmentsPage />}
          />

          <Route
            path="/guides"
            element={<GuidesPage />}
          />

          <Route
            path="/guided-setup"
            element={<GuidedSetupPage />}
          />

          <Route
            path="/checklist"
            element={
              <PremiumRoute>
                <ForgottenChecklistPage />
              </PremiumRoute>
            }
          />

          <Route
            path="/faq"
            element={<FaqPage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>

        <Route
          path="/commitments/new"
          element={
            <ProtectedRoute>
              <AddCommitmentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/commitments/:commitmentId"
          element={
            <ProtectedRoute>
              <CommitmentDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/commitments/:commitmentId/edit"
          element={
            <ProtectedRoute>
              <EditCommitmentPage />
            </ProtectedRoute>
          }
        />

        {/* Handles unknown routes with a predictable fallback. */}
        <Route
          path="*"
          element={<Navigate to="/register" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;