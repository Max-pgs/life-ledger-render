import { useState } from "react";
import { Link, useNavigate } from "react-router";

import Logo from "../components/Logo";
import { logoutUser } from "../services/authService";

import "./DashboardLayout.css";

function DashboardLayout({ logoRef, children }) {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /* Prevents duplicate logout requests while the current one is in progress. */
  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logoutUser();
    } catch {
      // Local authentication data is still cleared when the API request fails.
    } finally {
      /* Clears all client-side authentication data even if the API request fails. */
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("dashboardIntroShown");

      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        {/* The ref provides the target position for the post-login logo animation. */}
        <div ref={logoRef} className="dashboard-sidebar__logo">
          <Logo variant="compact" />
        </div>

        <nav
          className="dashboard-layout__nav"
          aria-label="Main navigation"
        >
          <Link
            to="/dashboard"
            className="dashboard-layout__nav-link dashboard-layout__nav-link--active"
            aria-current="page"
          >
            Overview
          </Link>

          <button
            type="button"
            className="dashboard-layout__nav-link"
            disabled
          >
            Commitments
          </button>

          <button
            type="button"
            className="dashboard-layout__nav-link"
            disabled
          >
            Guided setup
          </button>

          <button
            type="button"
            className="dashboard-layout__nav-link"
            disabled
          >
            UK guidance
          </button>

          <button
            type="button"
            className="dashboard-layout__nav-link"
            disabled
          >
            Settings
          </button>
        </nav>

        <div className="dashboard-layout__sidebar-footer">
          <button
            type="button"
            className="dashboard-layout__logout"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <span>{isLoggingOut ? "Logging out" : "Log out"}</span>
          </button>

        </div>
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;