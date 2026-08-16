import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";

import { getCommitment, getCommitmentPayments } from "../services/commitmentService";

import "./CommitmentDetailPage.css";

function CommitmentDetailPage() {
  const { commitmentId } = useParams();
  const [searchParams] = useSearchParams();

  const backPath =
    searchParams.get("from") === "archived"
      ? "/commitments?view=archived"
      : "/commitments";

  const [commitment, setCommitment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadCommitment() {
      try {
        const [
          commitmentData,
          paymentData,
        ] = await Promise.all([
          getCommitment(commitmentId),
          getCommitmentPayments(commitmentId),
        ]);

        setCommitment(commitmentData);
        setPayments(paymentData);
      } catch {
        setLoadError(
          "Commitment could not be loaded. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadCommitment();
  }, [commitmentId]);

  /* Formats date-only API values without shifting them across time zones. */
  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not set";
    }

    return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB");
  }

  if (isLoading) {
    return (
      <section className="commitment-detail-page">
        <p>Loading commitment...</p>
      </section>
    );
  }

  function formatPaymentStatus(status) {
    if (!status) {
      return "—";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (loadError || !commitment) {
    return (
      <section className="commitment-detail-page">
        <div role="alert">
          {loadError || "Commitment not found."}
        </div>

        <Link to="/commitments">
          Back to commitments
        </Link>
      </section>
    );
  }

  return (
    <section className="commitment-detail-page">
      <header className="commitment-detail-page__header">
        <div>
          <p className="commitment-detail-page__eyebrow">
            Commitment details
          </p>

          <h1>{commitment.title}</h1>

          <div className="commitment-detail-page__group">
            <p>
              {commitment.group?.name || "No commitment group"}
            </p>

            {commitment.group?.id && (
              <Link
                className="commitment-detail-page__guide-link"
                to={`/guides?group=${commitment.group.id}`}
              >
                View full guide
              </Link>
            )}
          </div>
        </div>

        <div className="commitment-detail-page__actions">
          {!commitment.is_archived && (
            <Link
              className="commitment-detail-page__edit"
              to={`/commitments/${commitment.id}/edit`}
            >
              Edit
            </Link>
          )}

          <Link
            className="commitment-detail-page__back"
            to={backPath}
          >
            Back
          </Link>
        </div>
      </header>

      <div className="commitment-detail">
        <section className="commitment-detail__section">
          <h2>Basic details</h2>

          <dl className="commitment-detail__grid">
            <div>
              <dt>Provider</dt>
              <dd>{commitment.provider_name || "Not set"}</dd>
            </div>

            <div>
              <dt>Priority</dt>
              <dd>{commitment.priority || "Not set"}</dd>
            </div>

            <div>
              <dt>Status</dt>
              <dd>{commitment.status?.name || "Not set"}</dd>
            </div>
          </dl>
        </section>

        <section className="commitment-detail__section">
          <h2>Dates & deadlines</h2>

          <dl className="commitment-detail__grid">
            <div>
              <dt>Next due date</dt>
              <dd>{formatDate(commitment.due_date)}</dd>
            </div>

            <div>
              <dt>Renewal date</dt>
              <dd>{formatDate(commitment.renewal_date)}</dd>
            </div>

            <div>
              <dt>Contract end date</dt>
              <dd>{formatDate(commitment.contract_end_date)}</dd>
            </div>

            <div>
              <dt>Notice period</dt>
              <dd>
                {commitment.notice_period_days !== null &&
                  commitment.notice_period_days !== undefined
                  ? `${commitment.notice_period_days} days`
                  : "Not set"}
              </dd>
            </div>

            <div>
              <dt>Cancellation deadline</dt>
              <dd>
                {commitment.cancellation_deadline
                  ? formatDate(commitment.cancellation_deadline)
                  : "Not applicable"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="commitment-detail__section">
          <h2>Payment details</h2>

          <dl className="commitment-detail__grid">
            <div>
              <dt>Amount</dt>
              <dd>
                {commitment.amount
                  ? `£${commitment.amount}`
                  : "Not set"}
              </dd>
            </div>

            <div>
              <dt>Payment frequency</dt>
              <dd>
                {commitment.payment_frequency
                  ?.replaceAll("_", " ") || "Not set"}
              </dd>
            </div>

            <div>
              <dt>Payment status</dt>
              <dd>
                {commitment.payment_status
                  ?.replaceAll("_", " ") || "Not applicable"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="commitment-detail__section">
          <div className="commitment-detail__section-header">
            <div>
              <p className="commitment-detail__eyebrow">
                Payment history
              </p>

              <h2>Payment cycles</h2>
            </div>
          </div>

          {payments.length === 0 ? (
            <p className="commitment-detail__empty">
              No payment history is available for this commitment.
            </p>
          ) : (
            <div className="commitment-payment-history">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="commitment-payment-history__item"
                >
                  <div className="commitment-payment-history__main">
                    <strong>
                      {formatDate(payment.due_date)}
                    </strong>

                    <span>
                      {payment.amount
                        ? `£${Number.parseFloat(payment.amount).toFixed(2)}`
                        : "No amount"}
                    </span>
                  </div>

                  <div className="commitment-payment-history__status">
                    <span
                      className={`commitment-payment-history__badge commitment-payment-history__badge--${payment.effective_status || payment.status
                        }`}
                    >
                      {formatPaymentStatus(
                        payment.effective_status || payment.status,
                      )}
                    </span>

                    {payment.paid_at && (
                      <small>
                        Paid{" "}
                        {new Date(payment.paid_at).toLocaleDateString(
                          "en-GB",
                        )}
                      </small>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="commitment-detail__section">
          <h2>Notes</h2>

          <p>
            {commitment.notes || "No notes added."}
          </p>
        </section>
      </div>
    </section>
  );
}

export default CommitmentDetailPage;