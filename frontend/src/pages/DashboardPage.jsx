import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";

import LoginSuccessTransition from "../components/LoginSuccessTransition";

const INTRO_SESSION_KEY = "dashboardIntroShown";

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dashboardLogoRef } = useOutletContext();

  /* Shows the intro after login, or on the first dashboard visit in this session. */
  const [showLoginTransition, setShowLoginTransition] = useState(() => {
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== "true";
  });

  /* Marks the intro as completed and removes the temporary route state. */
  function handleTransitionComplete() {
    setShowLoginTransition(false);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }

  useEffect(() => {
    if (showLoginTransition) {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    }
  }, [showLoginTransition]);

  return (
    <>
      <div>
        <p>Dashboard</p>

        <h1>Welcome to Life Ledger</h1>

        <p>
          Your commitments, renewals and deadlines will appear here.
        </p>
      </div>

      {showLoginTransition && (
        <LoginSuccessTransition
          targetRef={dashboardLogoRef}
          onComplete={handleTransitionComplete}
        />
      )}
    </>
  );
}

export default DashboardPage;