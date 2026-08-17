import { useEffect, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router";
import {
  getCommitments,
  getCurrentMonthPayments,
  getHighPriorityCommitments,
  getOverdueCommitments,
  getReviewSoonCommitments,
  getUpcomingCommitments,
} from "../services/commitmentService";

import LoginSuccessTransition from "../components/LoginSuccessTransition";

import upcomingIcon from "../assets/icons/dashboard/upcoming.svg";
import overdueIcon from "../assets/icons/dashboard/overdue.svg";
import highPriorityIcon from "../assets/icons/dashboard/high-priority.svg";
import reviewNeededIcon from "../assets/icons/dashboard/review-needed.svg";
import guidedSetupIcon from "../assets/icons/dashboard/guide-setup.svg";
import ukGuidesIcon from "../assets/icons/dashboard/uk-guides.svg";
import achievementsIcon from "../assets/icons/dashboard/achievements.svg";

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
  const { dashboardLogoRef, accountPlan } = useOutletContext();

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

  const [reviewSoonCommitments, setReviewSoonCommitments] = useState([]);
  const [reviewSoonLoading, setReviewSoonLoading] = useState(true);
  const [reviewSoonError, setReviewSoonError] = useState("");

  const [paymentCommitments, setPaymentCommitments] = useState([]);
  const [currentMonthPayments, setCurrentMonthPayments] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState("");

  const [hoveredPaymentStatus, setHoveredPaymentStatus] = useState(null);

  const visibleUpcomingCommitments = upcomingCommitments.slice(0, 5);
  const visibleOverdueCommitments = overdueCommitments.slice(0, 5);
  const visibleHighPriorityCommitments = highPriorityCommitments.slice(0, 5);
  const visibleReviewSoonCommitments = reviewSoonCommitments.slice(0, 5);


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
    async function loadReviewSoonCommitments() {
      try {
        const data = await getReviewSoonCommitments();
        setReviewSoonCommitments(data);
      } catch {
        setReviewSoonError("Unable to load commitments needing review.");
      } finally {
        setReviewSoonLoading(false);
      }
    }

    loadReviewSoonCommitments();
  }, []);

  useEffect(() => {
    async function loadPaymentCommitments() {
      try {
        const data = await getCommitments();
        setPaymentCommitments(data);
      } catch {
        // Keep dashboard insights available independently from payment-cycle data.
      }
    }

    loadPaymentCommitments();
  }, []);

  useEffect(() => {
    async function loadCurrentMonthPayments() {
      try {
        const data = await getCurrentMonthPayments();
        setCurrentMonthPayments(data);
      } catch {
        setPaymentError("Unable to load payment status summary.");
      } finally {
        setPaymentLoading(false);
      }
    }

    loadCurrentMonthPayments();
  }, []);

  function openMonthlyPaymentStatus(status) {
    navigate(`/commitments?payment_cycle_status=${status}`);
  }

  const paymentStatusSummary = currentMonthPayments.reduce(
    (summary, payment) => {
      const status =
        payment.effective_status ||
        payment.status ||
        "pending";

      const amount = Number.parseFloat(payment.amount) || 0;

      summary[status].count += 1;
      summary[status].amount += amount;

      return summary;
    },
    {
      paid: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
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

  const paymentStatusPayments = {
    paid: currentMonthPayments.filter(
      (payment) =>
        (payment.effective_status || payment.status) === "paid",
    ),
    pending: currentMonthPayments.filter(
      (payment) =>
        (payment.effective_status || payment.status) === "pending",
    ),
    overdue: currentMonthPayments.filter(
      (payment) =>
        (payment.effective_status || payment.status) === "overdue",
    ),
  };

  const paymentSegments = [
    {
      status: "paid",
      label: "Paid",
      percentage: paidPercentage,
      offset: 0,
    },
    {
      status: "pending",
      label: "Pending",
      percentage: pendingPercentage,
      offset: paidPercentage,
    },
    {
      status: "overdue",
      label: "Overdue",
      percentage: overduePercentage,
      offset: paidPercentage + pendingPercentage,
    },
  ];

  const hoveredPayments = hoveredPaymentStatus
    ? paymentStatusPayments[hoveredPaymentStatus].slice(0, 5)
    : [];

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const recurringCommitments = paymentCommitments.filter(
    (commitment) =>
      commitment.amount &&
      commitment.payment_frequency &&
      commitment.payment_frequency !== "one_off",
  );

  const monthlyRecurringCost = recurringCommitments.reduce(
    (total, commitment) => {
      const amount = Number.parseFloat(commitment.amount) || 0;

      switch (commitment.payment_frequency) {
        case "weekly":
          return total + (amount * 52) / 12;

        case "monthly":
          return total + amount;

        case "quarterly":
          return total + amount / 3;

        case "annually":
          return total + amount / 12;

        default:
          return total;
      }
    },
    0,
  );

  const annualRecurringCost = monthlyRecurringCost * 12;

  const groupCosts = recurringCommitments.reduce(
    (totals, commitment) => {
      const groupName =
        commitment.group?.name || "Uncategorised";

      const amount = Number.parseFloat(commitment.amount) || 0;

      let annualAmount;

      switch (commitment.payment_frequency) {
        case "weekly":
          annualAmount = amount * 52;
          break;

        case "monthly":
          annualAmount = amount * 12;
          break;

        case "quarterly":
          annualAmount = amount * 4;
          break;

        case "annually":
          annualAmount = amount;
          break;

        default:
          annualAmount = 0;
      }

      totals[groupName] =
        (totals[groupName] || 0) + annualAmount;

      return totals;
    },
    {},
  );

  const highestCostGroup =
    Object.entries(groupCosts).sort(
      ([, firstAmount], [, secondAmount]) =>
        secondAmount - firstAmount,
    )[0] || null;

  const totalCommitments = paymentCommitments.length;

  const trackedGroups = new Set(
    paymentCommitments
      .map((commitment) => commitment.group?.id)
      .filter(Boolean),
  ).size;

  const achievements = [
    {
      id: "first-step",
      title: "First Step",
      description: "Add your first commitment.",
      unlocked: totalCommitments >= 1,
      progress: `${Math.min(totalCommitments, 1)} / 1`,
    },
    {
      id: "getting-organised",
      title: "Getting Organised",
      description: "Track at least 5 commitments.",
      unlocked: totalCommitments >= 5,
      progress: `${Math.min(totalCommitments, 5)} / 5`,
    },
    {
      id: "life-admin-pro",
      title: "Well organised",
      description: "Track at least 10 commitments.",
      unlocked: totalCommitments >= 10,
      progress: `${Math.min(totalCommitments, 10)} / 10`,
    },
    {
      id: "well-covered",
      title: "Well Covered",
      description: "Track commitments across 4 different groups.",
      unlocked: trackedGroups >= 4,
      progress: `${Math.min(trackedGroups, 4)} / 4 groups`,
    },
    {
      id: "on-track",
      title: "On Track",
      description: "Track at least 3 commitments with none overdue.",
      unlocked:
        totalCommitments >= 3 &&
        overdueCommitments.length === 0,
      progress:
        totalCommitments < 3
          ? `${Math.min(totalCommitments, 3)} / 3 commitments`
          : `${overdueCommitments.length} overdue`,
    },
    ...(accountPlan === "premium"
      ? [
        {
          id: "review-ready",
          title: "Review Ready",
          description: "Keep at least 3 commitments with no reviews currently due.",
          unlocked:
            totalCommitments >= 3 &&
            reviewSoonCommitments.length === 0,
          progress:
            totalCommitments < 3
              ? `${Math.min(totalCommitments, 3)} / 3 commitments`
              : `${reviewSoonCommitments.length} reviews due`,
          premium: true,
        },
        {
          id: "priority-planner",
          title: "Priority Planner",
          description: "Track at least 3 high-priority commitments.",
          unlocked: highPriorityCommitments.length >= 3,
          progress: `${Math.min(highPriorityCommitments.length, 3)} / 3`,
          premium: true,
        },
        {
          id: "household-organiser",
          title: "Household Organiser",
          description: "Organise shared household commitments.",
          unlocked: false,
          progress: "Premium preview",
          premium: true,
        },
      ]
      : []),
  ];

  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
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
          <button
            type="button"
            className="dashboard-summary-card dashboard-summary-card--upcoming"
            onClick={() => scrollToSection("upcoming-commitments")}
          >
            <div className="dashboard-summary-card__content">
              <img
                src={upcomingIcon}
                alt=""
                className="dashboard-summary-card__icon"
              />

              <div className="dashboard-summary-card__text">
                <strong className="dashboard-summary-card__value">
                  {upcomingLoading
                    ? "—"
                    : upcomingError
                      ? "—"
                      : upcomingCommitments.length}
                </strong>

                <span className="dashboard-summary-card__label">
                  Upcoming
                </span>

                <span className="dashboard-summary-card__hint">
                  Due in the next 30 days
                </span>
              </div>
            </div>
          </button>
          <button
            type="button"
            className="dashboard-summary-card dashboard-summary-card--overdue"
            onClick={() => scrollToSection("overdue-commitments")}
          >
            <div className="dashboard-summary-card__content">
              <img
                src={overdueIcon}
                alt=""
                className="dashboard-summary-card__icon"
              />

              <div className="dashboard-summary-card__text">
                <strong className="dashboard-summary-card__value">
                  {overdueLoading
                    ? "—"
                    : overdueError
                      ? "—"
                      : overdueCommitments.length}
                </strong>

                <span className="dashboard-summary-card__label">
                  Overdue
                </span>

                <span className="dashboard-summary-card__hint">
                  Needs your attention
                </span>
              </div>
            </div>
          </button>
          <button
            type="button"
            className="dashboard-summary-card dashboard-summary-card--high-priority"
            onClick={() => scrollToSection("high-priority-commitments")}
          >
            <div className="dashboard-summary-card__content">
              <img
                src={highPriorityIcon}
                alt=""
                className="dashboard-summary-card__icon"
              />

              <div className="dashboard-summary-card__text">
                <strong className="dashboard-summary-card__value">
                  {highPriorityLoading
                    ? "—"
                    : highPriorityError
                      ? "—"
                      : highPriorityCommitments.length}
                </strong>

                <span className="dashboard-summary-card__label">
                  High priority
                </span>

                <span className="dashboard-summary-card__hint">
                  Important commitments
                </span>
              </div>
            </div>
          </button>
          <button
            type="button"
            className="dashboard-summary-card dashboard-summary-card--review-needed"
            onClick={() => scrollToSection("review-needed")}
          >
            <div className="dashboard-summary-card__content">
              <img
                src={reviewNeededIcon}
                alt=""
                className="dashboard-summary-card__icon"
              />

              <div className="dashboard-summary-card__text">
                <strong className="dashboard-summary-card__value">
                  {reviewSoonLoading
                    ? "—"
                    : reviewSoonError
                      ? "—"
                      : reviewSoonCommitments.length}
                </strong>

                <span className="dashboard-summary-card__label">
                  Review needed
                </span>

                <span className="dashboard-summary-card__hint">
                  Review within 30 days
                </span>
              </div>
            </div>
          </button>
        </section>
        <div className="dashboard-overview-grid">
          <section className="dashboard-payment-status">
            <div className="dashboard-payment-status__header">
              <div>
                <p className="dashboard-payment-status__eyebrow">
                  Current month
                </p>
                <h2>Payment status</h2>
                <p className="dashboard-payment-status__subtitle">
                  Paid, pending and overdue payments due this month.
                </p>
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
                <div className="dashboard-payment-status__chart-wrapper">
                  <div className="dashboard-payment-status__chart">
                    <svg
                      className="dashboard-payment-status__chart-svg"
                      viewBox="0 0 100 100"
                      aria-label="Payment status chart"
                    >
                      {paymentSegments.map((segment) => (
                        segment.percentage > 0 && (
                          <circle
                            key={segment.status}
                            className={`dashboard-payment-status__segment dashboard-payment-status__segment--${segment.status}`}
                            cx="50"
                            cy="50"
                            r="42"
                            pathLength="100"
                            fill="none"
                            strokeWidth="22"
                            strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                            strokeDashoffset={-segment.offset}
                            transform="rotate(-90 50 50)"
                            role="button"
                            tabIndex="0"
                            aria-label={`View ${segment.label.toLowerCase()} commitments`}
                            onPointerEnter={() =>
                              setHoveredPaymentStatus(segment.status)
                            }
                            onPointerLeave={() =>
                              setHoveredPaymentStatus(null)
                            }
                            onClick={() =>
                              openMonthlyPaymentStatus(segment.status)
                            }
                            onKeyDown={(event) => {
                              if (
                                event.key === "Enter" ||
                                event.key === " "
                              ) {
                                event.preventDefault();
                                openMonthlyPaymentStatus(segment.status);
                              }
                            }}
                          />
                        )
                      ))}
                    </svg>

                    <div className="dashboard-payment-status__chart-centre">
                      <strong>{formatCurrency(trackedPaymentAmount)}</strong>
                    </div>
                  </div>

                  {hoveredPaymentStatus && (
                    <div className="dashboard-payment-status__preview">
                      <div className="dashboard-payment-status__preview-header">
                        <strong>
                          {paymentSegments.find(
                            (segment) => segment.status === hoveredPaymentStatus,
                          )?.label}
                        </strong>

                        <span>
                          {paymentStatusPayments[hoveredPaymentStatus].length} payments
                        </span>
                      </div>

                      {hoveredPayments.length > 0 ? (
                        <div className="dashboard-payment-status__preview-list">
                          {hoveredPayments.map((payment) => (
                            <button
                              key={payment.id}
                              type="button"
                              className="dashboard-payment-status__preview-item"
                              onClick={() =>
                                navigate(`/commitments/${payment.commitment_id}`)
                              }
                            >
                              <strong>{payment.commitment_title}</strong>

                              <span>
                                {payment.group_name || "No commitment group"}
                              </span>

                              <div className="dashboard-payment-status__preview-meta">
                                <span>
                                  {payment.amount
                                    ? formatCurrency(payment.amount)
                                    : "No amount"}
                                </span>

                                <span>
                                  {payment.due_date
                                    ? `Due ${formatDate(payment.due_date)}`
                                    : "No due date"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="dashboard-payment-status__preview-empty">
                          No commitments in this category.
                        </p>
                      )}

                      {paymentStatusPayments[hoveredPaymentStatus].length > 5 && (
                        <span className="dashboard-payment-status__preview-more">
                          +{" "}
                          {paymentStatusPayments[hoveredPaymentStatus].length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="dashboard-payment-status__legend">
                  <button
                    type="button"
                    className="dashboard-payment-status__legend-item"
                    onClick={() => openMonthlyPaymentStatus("paid")}
                  >
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
                  </button>

                  <button
                    type="button"
                    className="dashboard-payment-status__legend-item"
                    onClick={() => openMonthlyPaymentStatus("pending")}
                  >
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
                  </button>

                  <button
                    type="button"
                    className="dashboard-payment-status__legend-item"
                    onClick={() => openMonthlyPaymentStatus("overdue")}
                  >
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
                  </button>
                </div>
              </div>
            )}
          </section>
          {accountPlan === "premium" && (
            <section className="dashboard-payment-status dashboard-payment-status--family">
              <div className="dashboard-payment-status__header">
                <div>
                  <p className="dashboard-payment-status__eyebrow">
                    Premium preview
                  </p>
                  <h2>Family payment status</h2>
                </div>

                <span className="dashboard-payment-status__tracked">
                  Group view
                </span>
              </div>

              <div className="dashboard-payment-status__content">
                <div className="dashboard-payment-status__chart">
                  <svg
                    className="dashboard-payment-status__chart-svg"
                    viewBox="0 0 100 100"
                    aria-label="Family payment status preview chart"
                  >
                    <circle
                      className="dashboard-payment-status__segment dashboard-payment-status__segment--paid"
                      cx="50"
                      cy="50"
                      r="42"
                      pathLength="100"
                      fill="none"
                      strokeWidth="22"
                      strokeDasharray="50 50"
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />

                    <circle
                      className="dashboard-payment-status__segment dashboard-payment-status__segment--pending"
                      cx="50"
                      cy="50"
                      r="42"
                      pathLength="100"
                      fill="none"
                      strokeWidth="22"
                      strokeDasharray="30 70"
                      strokeDashoffset="-50"
                      transform="rotate(-90 50 50)"
                    />

                    <circle
                      className="dashboard-payment-status__segment dashboard-payment-status__segment--overdue"
                      cx="50"
                      cy="50"
                      r="42"
                      pathLength="100"
                      fill="none"
                      strokeWidth="22"
                      strokeDasharray="20 80"
                      strokeDashoffset="-80"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>

                  <div className="dashboard-payment-status__chart-centre">
                    <strong>5</strong>
                    <span>shared</span>
                  </div>
                </div>

                <div className="dashboard-payment-status__legend">
                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--paid" />
                      Paid
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>50%</strong>
                    </span>
                  </div>

                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--pending" />
                      Pending
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>30%</strong>
                    </span>
                  </div>

                  <div className="dashboard-payment-status__legend-item">
                    <span className="dashboard-payment-status__legend-label">
                      <span className="dashboard-payment-status__dot dashboard-payment-status__dot--overdue" />
                      Overdue
                    </span>

                    <span className="dashboard-payment-status__legend-value">
                      <strong>20%</strong>
                    </span>
                  </div>
                </div>
              </div>

              <p className="dashboard-family-preview__note">
                Premium preview of shared household commitments. Multi-user access
                is not enabled in this prototype.
              </p>
            </section>
          )}
          {accountPlan === "premium" && (
            <section className="dashboard-premium-insights">
              <div className="dashboard-premium-insights__header">
                <div>
                  <h2>Advanced insights</h2>
                </div>

                <span className="dashboard-premium-insights__badge">
                  Premium
                </span>
              </div>

              <div className="dashboard-premium-insights__grid">
                <article className="dashboard-premium-insight">
                  <span>Estimated average monthly recurring cost</span>

                  <strong>
                    £{monthlyRecurringCost.toFixed(2)}
                  </strong>
                </article>

                <article className="dashboard-premium-insight">
                  <span>Estimated annual recurring cost</span>

                  <strong>
                    £{annualRecurringCost.toFixed(2)}
                  </strong>
                </article>

                <article className="dashboard-premium-insight">
                  <span>Highest-cost group</span>

                  <strong>
                    {highestCostGroup
                      ? highestCostGroup[0]
                      : "Not enough data"}
                  </strong>

                  {highestCostGroup && (
                    <small>
                      £{highestCostGroup[1].toFixed(2)} per year
                    </small>
                  )}
                </article>
              </div>
            </section>
          )}
          <section
            id="upcoming-commitments"
            className={`dashboard-upcoming ${accountPlan === "premium"
              ? "dashboard-upcoming--premium"
              : ""
              }`}
          >
            <div className="dashboard-upcoming__header">
              <div>
                <p className="dashboard-upcoming__eyebrow">
                  Next 30 days
                </p>
                <h2>Upcoming commitments</h2>
              </div>
              <div className="dashboard-section-actions">
                <span className="dashboard-section-count">
                  {Math.min(upcomingCommitments.length, 5)}/{upcomingCommitments.length}
                </span>

                <button
                  type="button"
                  className="dashboard-upcoming__view-all"
                  onClick={() => navigate("/commitments?upcoming=30")}
                >
                  View all
                </button>
              </div>
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
                  {visibleUpcomingCommitments.map((commitment) => (
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
        <section className="dashboard-support-grid">
          <button
            type="button"
            className="dashboard-support-card dashboard-support-card--guided"
            onClick={() => navigate("/guided-setup")}
          >
            <img
              src={guidedSetupIcon}
              alt=""
              className="dashboard-support-card__icon"
            />

            <div className="dashboard-support-card__content">
              <p className="dashboard-support-card__eyebrow">
                Get started
              </p>

              <h2>Guided setup</h2>

              <p>
                Find common UK commitments that may be relevant to you.
              </p>
            </div>
          </button>

          <button
            type="button"
            className="dashboard-support-card dashboard-support-card--guides"
            onClick={() => navigate("/guides")}
          >
            <img
              src={ukGuidesIcon}
              alt=""
              className="dashboard-support-card__icon"
            />

            <div className="dashboard-support-card__content">
              <p className="dashboard-support-card__eyebrow">
                UK information
              </p>

              <h2>UK guides</h2>

              <p>
                Practical guidance and trusted links for UK life admin.
              </p>
            </div>
          </button>

          <article className="dashboard-support-card dashboard-support-card--achievements">
            <div className="dashboard-achievements__header">
              <div className="dashboard-achievements__heading">
                <img
                  src={achievementsIcon}
                  alt=""
                  className="dashboard-achievements__icon"
                />

                <div>
                  <p className="dashboard-support-card__eyebrow">
                    Your progress
                  </p>

                  <h2>Achievements</h2>
                </div>
              </div>

              <div className="dashboard-achievements__summary">
                <strong>
                  {unlockedAchievements.length} / {achievements.length}
                </strong>
                <span>unlocked</span>
              </div>
            </div>

            <div className="dashboard-achievements__list">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={
                    achievement.unlocked
                      ? "dashboard-achievement dashboard-achievement--unlocked"
                      : "dashboard-achievement"
                  }
                >
                  <span
                    className="dashboard-achievement__status"
                    aria-hidden="true"
                  >
                    {achievement.unlocked ? "✓" : "○"}
                  </span>

                  <div className="dashboard-achievement__content">
                    {achievement.premium && (
                      <span className="dashboard-achievement__premium-badge">
                        Premium
                      </span>
                    )}

                    <strong>{achievement.title}</strong>

                    <span>{achievement.description}</span>

                    {!achievement.unlocked && (
                      <span className="dashboard-achievement__progress">
                        {achievement.progress}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
        <section id="overdue-commitments" className="dashboard-overdue">
          <div className="dashboard-overdue__header">
            <div>
              <p className="dashboard-overdue__eyebrow">
                Past due
              </p>
              <h2>Overdue commitments</h2>
            </div>
            <div className="dashboard-section-actions">
              <span className="dashboard-section-count">
                {Math.min(overdueCommitments.length, 5)}/{overdueCommitments.length}
              </span>

              <button
                type="button"
                className="dashboard-overdue__view-all"
                onClick={() => navigate("/commitments?overdue=true")}
              >
                View all
              </button>
            </div>
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
                {visibleOverdueCommitments.map((commitment) => (
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
        <section id="high-priority-commitments" className="dashboard-high-priority">
          <div className="dashboard-high-priority__header">
            <div>
              <p className="dashboard-high-priority__eyebrow">
                Important
              </p>
              <h2>High priority commitments</h2>
            </div>
            <div className="dashboard-section-actions">
              <span className="dashboard-section-count">
                {Math.min(highPriorityCommitments.length, 5)}/{highPriorityCommitments.length}
              </span>

              <button
                type="button"
                className="dashboard-high-priority__view-all"
                onClick={() => navigate("/commitments?priority=high")}
              >
                View all
              </button>
            </div>
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
                {visibleHighPriorityCommitments.map((commitment) => (
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
        <section id="review-needed" className="dashboard-review-needed">
          <div className="dashboard-review-needed__header">
            <div>
              <p className="dashboard-review-needed__eyebrow">
                Review soon
              </p>
              <h2>Review needed</h2>
            </div>
            <div className="dashboard-section-actions">
              <span className="dashboard-section-count">
                {Math.min(reviewSoonCommitments.length, 5)}/{reviewSoonCommitments.length}
              </span>

              <button
                type="button"
                className="dashboard-review-needed__view-all"
                onClick={() => navigate("/commitments?review=needed")}
              >
                View all
              </button>
            </div>
          </div>

          {reviewSoonLoading && (
            <p className="dashboard-review-needed__message">
              Loading commitments needing review...
            </p>
          )}

          {!reviewSoonLoading && reviewSoonError && (
            <p className="dashboard-review-needed__message dashboard-review-needed__message--error">
              {reviewSoonError}
            </p>
          )}

          {!reviewSoonLoading &&
            !reviewSoonError &&
            reviewSoonCommitments.length === 0 && (
              <p className="dashboard-review-needed__message">
                You have no commitments requiring review in the next 30 days.
              </p>
            )}

          {!reviewSoonLoading &&
            !reviewSoonError &&
            reviewSoonCommitments.length > 0 && (
              <div className="dashboard-review-needed__list">
                {visibleReviewSoonCommitments.map((commitment) => (
                  <button
                    key={commitment.id}
                    type="button"
                    className="dashboard-review-needed-item"
                    onClick={() =>
                      navigate(`/commitments/${commitment.id}`)
                    }
                  >
                    <div className="dashboard-review-needed-item__main">
                      <strong>{commitment.title}</strong>
                      <span>
                        {commitment.group?.name || "No commitment group"}
                      </span>
                    </div>

                    <div className="dashboard-review-needed-item__meta">
                      <span>Review by</span>
                      <strong>
                        {formatDate(commitment.cancellation_deadline)}
                      </strong>
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