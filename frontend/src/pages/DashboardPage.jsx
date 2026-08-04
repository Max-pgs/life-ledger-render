import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import LoginSuccessTransition from "../components/LoginSuccessTransition";
import DashboardLayout from "../layouts/DashboardLayout";

const INTRO_SESSION_KEY = "dashboardIntroShown";

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardLogoRef = useRef(null);

  /* Shows the intro after login, or on the first dashboard visit in this session. */
  const [showLoginTransition, setShowLoginTransition] = useState(() => {
    const openedAfterLogin =
      location.state?.showLoginTransition === true;

    const introAlreadyShown =
      sessionStorage.getItem(INTRO_SESSION_KEY) === "true";

    return openedAfterLogin || !introAlreadyShown;
  });

  /* Marks the intro as completed and removes the temporary route state. */
  function handleTransitionComplete() {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    setShowLoginTransition(false);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }

  return (
    <>
      <DashboardLayout logoRef={dashboardLogoRef}>
        <p>OVERVIEW</p>
        <h1>Welcome to Life Ledger</h1>

        <p>
          Your commitments, renewals and deadlines will appear here.
        </p>
      </DashboardLayout>

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