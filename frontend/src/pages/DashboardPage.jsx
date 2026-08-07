import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import {
  getCommitments,
  getHighPriorityCommitments,
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value);
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

  const [highPriorityCommitments, setHighPriorityCommitments] = useState([]);
  const [highPriorityLoading, setHighPriorityLoading] = useState(true);
  const [highPriorityError, setHighPriorityError] = useState("");

  const [paymentCommitments, setPaymentCommitments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");

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

  useEffect(() => {
    async function loadHighPriorityCommitments() {
      try {
        const data = await getHighPriorityCommitments();
        setHighPriorityCommitments(data);
      } catch {
        setHighPriorityError("Unable to load high-priority commitments.");
      } finally {
        setHighPriorityLoading(false);
      }
    }

    loadHighPriorityCommitments();
  }, []);

  useEffect(() => {
    async function loadPaymentCommitments() {
      try {
        const data = await getCommitments();
        setPaymentCommitments(data);
      } catch {
        setPaymentError("Unable to load payment status summary.");
      } finally {
        setPaymentLoading(false);
      }
    }

    loadPaymentCommitments();
  }, []);

  const paymentStatusSummary = paymentCommitments.reduce(
    (summary, commitment) => {
      const status = commitment.payment_status || "not_applicable";
      const amount = Number.parseFloat(commitment.amount) || 0;

      summary[status].count += 1;
      summary[status].amount += amount;

      return summary;
    },
    {
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      not_applicable: { count: 0, amount: 0 },
    },
  );

  const trackedPaymentAmount =
    paymentStatusSummary.paid.amount +
    paymentStatusSummary.pending.amount +
    paymentStatusSummary.overdue.amount;

  const getPaymentPercentage = (amount) => {
    if (trackedPaymentAmount === 0) {
      return 0;
    }

    return Math.round((amount / trackedPaymentAmount) * 100);
  };

  const paidPercentage = getPaymentPercentage(
    paymentStatusSummary.paid.amount,
  );

  const pendingPercentage = getPaymentPercentage(
    paymentStatusSummary.pending.amount,
  );

  const overduePercentage = getPaymentPercentage(
    paymentStatusSummary.overdue.amount,
  );

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
            onClick={() => navigate("/commitments/new")}
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
          <article className="dashboard-summary-card">
            <span className="dashboard-summary-card__label">
              High priority
            </span>

            <strong className="dashboard-summary-card__value">
              {highPriorityLoading
                ? "—"
                : highPriorityError
                  ? "—"
                  : highPriorityCommitments.length}
            </strong>

            <span className="dashboard-summary-card__hint">
              Important commitments
            </span>
          </article>
        </section>
        <div className="dashboard-overview-grid">
          <section className="dashboard-payment-status">
            <div className="dashboard-payment-status__header">
              <div>
                <p className="dashboard-payment-status__eyebrow">
                  Payment overview
                </p>
                <h2>Payment status</h2>
              </div>

              <span className="dashboard-payment-status__tracked">
                {paymentStatusSummary.paid.count +
                  paymentStatusSummary.pending.count +
                  paymentStatusSummary.overdue.count}{" "}
                tracked
              </span>
            </div>

            {paymentLoading && (
              <p className="dashboard-payment-status__message">
                Loading payment status...
              </p>
            )}

            {!paymentLoading && paymentError && (
              <p className="dashboard-payment-status__message dashboard-payment-status__message--error">
                {paymentError}
              </p>
            )}

            {!paymentLoading && !paymentError && (
              <div className="dashboard-payment-status__content">
                <div
                  className="dashboard-payment-status__chart"
                  style={{
                    background: `conic-gradient(
          #76bd99 0% ${paidPercentage}%,
          #cdb77e ${paidPercentage}% ${paidPercentage + pendingPercentage}%,
          #d6a0a0 ${paidPercentage + pendingPercentage}% 100%
        )`,
                  }}
                >
                  <div className="dashboard-payment-status__chart-centre">
                    <strong>{formatCurrency(trackedPaymentAmount)}</strong>
                  </div>
                </div>

                <div className="dashboard-payment-status__legend">
                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--paid" />
                      Paid
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>
                        {formatCurrency(paymentStatusSummary.paid.amount)}
                      </strong>
                      <span>{paidPercentage}%</span>
                    </span>
                  </div>

                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--pending" />
                      Pending
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>
                        {formatCurrency(paymentStatusSummary.pending.amount)}
                      </strong>
                      <span>{pendingPercentage}%</span>
                    </span>
                  </div>

                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--overdue" />
                      Overdue
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>
                        {formatCurrency(paymentStatusSummary.overdue.amount)}
                      </strong>
                      <span>{overduePercentage}%</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
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
        </div>
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
        <section className="dashboard-high-priority">
          <div className="dashboard-high-priority__header">
            <div>
              <p className="dashboard-high-priority__eyebrow">
                Important
              </p>
              <h2>High priority commitments</h2>
            </div>

            <button
              type="button"
              className="dashboard-high-priority__view-all"
              onClick={() => navigate("/commitments")}
            >
              View all
            </button>
          </div>

          {highPriorityLoading && (
            <p className="dashboard-high-priority__message">
              Loading high-priority commitments...
            </p>
          )}

          {!highPriorityLoading && highPriorityError && (
            <p className="dashboard-high-priority__message dashboard-high-priority__message--error">
              {highPriorityError}
            </p>
          )}

          {!highPriorityLoading &&
            !highPriorityError &&
            highPriorityCommitments.length === 0 && (
              <p className="dashboard-high-priority__message">
                You have no high-priority commitments.
              </p>
            )}

          {!highPriorityLoading &&
            !highPriorityError &&
            highPriorityCommitments.length > 0 && (
              <div className="dashboard-high-priority__list">
                {highPriorityCommitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    type="button"
                    className="dashboard-high-priority-item"
                    onClick={() =>
                      navigate(`/commitments/${commitment.id}`)
                    }
                  >
                    <div className="dashboard-high-priority-item__main">
                      <strong>{commitment.title}</strong>

                      <span>
                        {commitment.group?.name || "No commitment group"}
                      </span>
                    </div>

                    <div className="dashboard-high-priority-item__meta">
                      <span>Priority</span>
                      <strong>High</strong>
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