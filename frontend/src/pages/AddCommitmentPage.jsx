import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import CommitmentForm from "../components/CommitmentForm";

import {
  createCommitment,
  getCommitmentGroups,
  getCommitmentStatuses,
} from "../services/commitmentService";

import "./AddCommitmentPage.css";

function AddCommitmentPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [groupData, statusData] = await Promise.all([
          getCommitmentGroups(),
          getCommitmentStatuses(),
        ]);

        setGroups(groupData);
        setStatuses(statusData);
      } catch {
        setLoadError(
          "Commitment options could not be loaded. Please try again.",
        );
      } finally {
        setIsLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function handleCreateCommitment(payload) {
    await createCommitment(payload);
    navigate("/commitments");
  }

  if (isLoadingOptions) {
    return (
      <section className="add-commitment-page">
        <p className="add-commitment-page__loading">
          Loading commitment options...
        </p>
      </section>
    );
  }

  return (
    <section className="add-commitment-page">
      <header className="add-commitment-page__header">
        <div>
          <p className="add-commitment-page__eyebrow">
            New commitment
          </p>

          <h1>Add commitment</h1>

          <p className="add-commitment-page__intro">
            Add the core details for this commitment and any optional information you want Life Ledger to track.
          </p>
        </div>
      </header>

      {loadError && (
        <div
          className="add-commitment-page__message add-commitment-page__message--error"
          role="alert"
        >
          {loadError}
        </div>
      )}

      <CommitmentForm
        groups={groups}
        statuses={statuses}
        onSubmit={handleCreateCommitment}
        onCancel={() => navigate("/commitments")}
        submitLabel="Add commitment"
        submittingLabel="Adding commitment..."
        loadError={loadError}
      />
    </section>
  );
}

export default AddCommitmentPage;