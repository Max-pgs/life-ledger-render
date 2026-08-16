import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router";

import Logo from "../components/Logo";
import { getAccount, logoutUser } from "../services/authService";

import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardLogoRef = useRef(null);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [accountPlan, setAccountPlan] = useState(null);

  useEffect(() => {
    async function loadAccountPlan() {
      try {
        const account = await getAccount();
        setAccountPlan(account.plan);
      } catch {
        setAccountPlan(null);
      }
    }

    loadAccountPlan();
  }, []);

  useEffect(() => {
    function handleAccountPlanChanged(event) {
      setAccountPlan(event.detail?.plan || null);
    }

    window.addEventListener(
      "account-plan-changed",
      handleAccountPlanChanged,
    );

    return () => {
      window.removeEventListener(
        "account-plan-changed",
        handleAccountPlanChanged,
      );
    };
  }, []);

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
        <div ref={dashboardLogoRef} className="dashboard-sidebar__logo">
          <Logo variant="compact" />
        </div>

        <button
          className="dashboard-sidebar__menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <div
          className={`dashboard-sidebar__mobile-menu ${isMobileMenuOpen
            ? "dashboard-sidebar__mobile-menu--open"
            : ""
            }`}
        >
          <nav
            className="dashboard-layout__nav"
            aria-label="Main navigation"
          >
            <Link
              to="/dashboard"
              className={`dashboard-layout__nav-link ${location.pathname === "/dashboard"
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

            <Link
              to="/commitments"
              className={`dashboard-layout__nav-link ${location.pathname === "/commitments"
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Commitments
            </Link>

            <Link
              to="/guided-setup"
              className={`dashboard-layout__nav-link ${location.pathname === "/guided-setup"
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Guided setup
            </Link>

            {accountPlan === "premium" && (
              <Link
                to="/checklist"
                className={`dashboard-layout__nav-link ${location.pathname === "/checklist"
                  ? "dashboard-layout__nav-link--active"
                  : ""
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                What have I forgotten?
              </Link>
            )}

            <Link
              to="/guides"
              className={`dashboard-layout__nav-link ${location.pathname.startsWith("/guides")
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              UK guidance
            </Link>

            <Link
              to="/faq"
              className={`dashboard-layout__nav-link ${location.pathname === "/faq"
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>

            <Link
              to="/privacy"
              className={`dashboard-layout__nav-link ${location.pathname === "/privacy"
                  ? "dashboard-layout__nav-link--active"
                  : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Privacy Policy
            </Link>

            <Link
              to="/settings"
              className={`dashboard-layout__nav-link ${location.pathname === "/settings"
                ? "dashboard-layout__nav-link--active"
                : ""
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </Link>
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
        </div>
      </aside >

      <main className="dashboard-content">
        <Outlet
          context={{
            dashboardLogoRef,
            accountPlan,
          }}
        />
      </main>
    </div >
  );
}

export default DashboardLayout;