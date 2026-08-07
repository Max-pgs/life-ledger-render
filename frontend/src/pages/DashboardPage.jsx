import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import {
  getOverdueCommitments,
  getUpcomingCommitments,
} from "../services/commitmentService";

import LoginSuccessTransition from "../components/LoginSuccessTransition";

import "./DashboardPage.css";

const INTRO_SESSION_KEY = "dashboardIntroShown";

function formatDate(date) {
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-GB").format(
    new Date(`${date}T00:00:00`),
  );
}

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dashboardLogoRef } = useOutletContext();

  /* Shows the intro after login, or on the first dashboard visit in this session. */
  const [showLoginTransition, setShowLoginTransition] = useState(() => {
    return sessionStorage.getItem(INTRO_SESSION_KEY) !== "true";
  });

  const [upcomingCommitments, setUpcomingCommitments] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [upcomingError, setUpcomingError] = useState("");

  const [overdueCommitments, setOverdueCommitments] = useState([]);
  const [overdueLoading, setOverdueLoading] = useState(true);
  const [overdueError, setOverdueError] = useState("");

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

  useEffect(() => {
    async function loadUpcomingCommitments() {
      try {
        const data = await getUpcomingCommitments();
        setUpcomingCommitments(data);
      } catch {
        setUpcomingError("Unable to load upcoming commitments.");
      } finally {
        setUpcomingLoading(false);
      }
    }

    loadUpcomingCommitments();
  }, []);

  useEffect(() => {
    async function loadOverdueCommitments() {
      try {
        const data = await getOverdueCommitments();
        setOverdueCommitments(data);
      } catch {
        setOverdueError("Unable to load overdue commitments.");
      } finally {
        setOverdueLoading(false);
      }
    }

    loadOverdueCommitments();
  }, []);

  return (
    <>
      <div className="dashboard-page">
        <div className="dashboard-page__header">
          <div>
            <p className="dashboard-page__eyebrow">Dashboard</p>
            <h1>Welcome to Life Ledger</h1>
            <p className="dashboard-page__intro">
              Keep track of your upcoming commitments and important deadlines.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-page__add-button"
            onClick={() => navigate("/commitments/add")}
          >
            Add commitment
          </button>
        </div>

        <section className="dashboard-page__summary">
          <article className="dashboard-summary-card">
            <span className="dashboard-summary-card__label">
              Upcoming
            </span>

            <strong className="dashboard-summary-card__value">
              {upcomingLoading
                ? "—"
                : upcomingError
                  ? "—"
                  : upcomingCommitments.length}
            </strong>

            <span className="dashboard-summary-card__hint">
              Due in the next 30 days
            </span>
          </article>
          <article className="dashboard-summary-card">
            <span className="dashboard-summary-card__label">
              Overdue
            </span>

            <strong className="dashboard-summary-card__value">
              {overdueLoading
                ? "—"
                : overdueError
                  ? "—"
                  : overdueCommitments.length}
            </strong>

            <span className="dashboard-summary-card__hint">
              Needs your attention
            </span>
          </article>
        </section>
        <section className="dashboard-upcoming">
          <div className="dashboard-upcoming__header">
            <div>
              <p className="dashboard-upcoming__eyebrow">
                Next 30 days
              </p>
              <h2>Upcoming commitments</h2>
            </div>

            <button
              type="button"
              className="dashboard-upcoming__view-all"
              onClick={() => navigate("/commitments")}
            >
              View all
            </button>
          </div>

          {upcomingLoading && (
            <p className="dashboard-upcoming__message">
              Loading upcoming commitments...
            </p>
          )}

          {!upcomingLoading && upcomingError && (
            <p className="dashboard-upcoming__message dashboard-upcoming__message--error">
              {upcomingError}
            </p>
          )}

          {!upcomingLoading &&
            !upcomingError &&
            upcomingCommitments.length === 0 && (
              <p className="dashboard-upcoming__message">
                No commitments are due in the next 30 days.
              </p>
            )}

          {!upcomingLoading &&
            !upcomingError &&
            upcomingCommitments.length > 0 && (
              <div className="dashboard-upcoming__list">
                {upcomingCommitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    type="button"
                    className="dashboard-upcoming-item"
                    onClick={() =>
                      navigate(`/commitments/${commitment.id}`)
                    }
                  >
                    <div className="dashboard-upcoming-item__main">
                      <strong>{commitment.title}</strong>

                      <span>
                        {commitment.group?.name || "No commitment group"}
                      </span>
                    </div>

                    <div className="dashboard-upcoming-item__due">
                      <span>Due</span>
                      <strong>{formatDate(commitment.due_date)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>
        <section className="dashboard-overdue">
          <div className="dashboard-overdue__header">
            <div>
              <p className="dashboard-overdue__eyebrow">
                Past due
              </p>
              <h2>Overdue commitments</h2>
            </div>

            <button
              type="button"
              className="dashboard-overdue__view-all"
              onClick={() => navigate("/commitments")}
            >
              View all
            </button>
          </div>

          {overdueLoading && (
            <p className="dashboard-overdue__message">
              Loading overdue commitments...
            </p>
          )}

          {!overdueLoading && overdueError && (
            <p className="dashboard-overdue__message dashboard-overdue__message--error">
              {overdueError}
            </p>
          )}

          {!overdueLoading &&
            !overdueError &&
            overdueCommitments.length === 0 && (
              <p className="dashboard-overdue__message">
                You have no overdue commitments.
              </p>
            )}

          {!overdueLoading &&
            !overdueError &&
            overdueCommitments.length > 0 && (
              <div className="dashboard-overdue__list">
                {overdueCommitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    type="button"
                    className="dashboard-overdue-item"
                    onClick={() =>
                      navigate(`/commitments/${commitment.id}`)
                    }
                  >
                    <div className="dashboard-overdue-item__main">
                      <strong>{commitment.title}</strong>

                      <span>
                        {commitment.group?.name || "No commitment group"}
                      </span>
                    </div>

                    <div className="dashboard-overdue-item__due">
                      <span>Due</span>
                      <strong>{formatDate(commitment.due_date)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </section>
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