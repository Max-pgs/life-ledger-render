import { Link } from "react-router";

import Logo from "../components/Logo";

import "./DashboardLayout.css";

function DashboardLayout({ logoRef, children }) {
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
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;