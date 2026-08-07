import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { getCommitment } from "../services/commitmentService";

import "./CommitmentDetailPage.css";

function CommitmentDetailPage() {
  const { commitmentId } = useParams();

  const [commitment, setCommitment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadCommitment() {
      try {
        const data = await getCommitment(commitmentId);
        setCommitment(data);
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

          <p>
            {commitment.group?.name || "No commitment group"}
          </p>
        </div>

        <div className="commitment-detail-page__actions">
          <Link
            className="commitment-detail-page__edit"
            to={`/commitments/${commitment.id}/edit`}
          >
            Edit
          </Link>

          <Link
            className="commitment-detail-page__back"
            to="/commitments"
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