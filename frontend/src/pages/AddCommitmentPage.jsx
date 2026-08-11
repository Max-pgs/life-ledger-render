import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import CommitmentForm from "../components/CommitmentForm";

import {
  createCommitment,
  getCommitmentGroups,
  getCommitmentStatuses,
  getCommitmentTemplates,
} from "../services/commitmentService";

import "./AddCommitmentPage.css";

function AddCommitmentPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [openTemplateGroupId, setOpenTemplateGroupId] = useState("");

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

  const templateInitialData = selectedTemplate
    ? {
      title: selectedTemplate.default_title,
      group_id: selectedTemplate.group,
      provider_name: selectedTemplate.default_provider_name || "",
      amount: selectedTemplate.default_amount || "",
      payment_frequency:
        selectedTemplate.default_payment_frequency || "",
      priority: selectedTemplate.default_priority || "",
      status_id: selectedTemplate.default_status || "",
    }
    : {};

  const recommendedFieldLabels = {
    provider_name: "Provider",
    amount: "Amount",
    payment_frequency: "Payment frequency",
    payment_status: "Payment status",
    due_date: "Next due date",
    contract_end_date: "Contract end date",
    notice_period_days: "Notice period",
    renewal_date: "Renewal date",
  };

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          groupData,
          statusData,
          templateData,
        ] = await Promise.all([
          getCommitmentGroups(),
          getCommitmentStatuses(),
          getCommitmentTemplates(),
        ]);

        setGroups(groupData);
        setStatuses(statusData);
        setTemplates(templateData);
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

  const templateGroups = groups
    .map((group) => ({
      ...group,
      templates: templates.filter(
        (template) => template.group === group.id,
      ),
    }))
    .filter((group) => group.templates.length > 0);

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
      <section className="commitment-templates">
        <div className="commitment-templates__header">
          <div>
            <p className="commitment-templates__eyebrow">
              Quick start
            </p>

            <h2>Start from a template</h2>
          </div>

          {selectedTemplateId && (
            <button
              type="button"
              className="commitment-templates__clear"
              onClick={() => setSelectedTemplateId("")}
            >
              Clear template
            </button>
          )}
        </div>

        <div className="commitment-template-groups">
          {templateGroups.map((group) => {
            const isOpen = openTemplateGroupId === group.id;

            return (
              <div
                key={group.id}
                className="commitment-template-group"
              >
                <button
                  type="button"
                  className="commitment-template-group__toggle"
                  onClick={() =>
                    setOpenTemplateGroupId(
                      isOpen ? "" : group.id,
                    )
                  }
                  aria-expanded={isOpen}
                >
                  <span>{group.name}</span>

                  <span
                    className="commitment-template-group__icon"
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="commitment-templates__grid">
                    {group.templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={`commitment-template-card ${selectedTemplateId === template.id
                            ? "commitment-template-card--selected"
                            : ""
                          }`}
                        onClick={() =>
                          setSelectedTemplateId(template.id)
                        }
                      >
                        <strong>{template.name}</strong>
                        <p>{template.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      {selectedTemplate && (
        <div className="commitment-template-guidance">
          <span className="commitment-template-guidance__label">
            Recommended for this template:
          </span>

          <span className="commitment-template-guidance__fields">
            {selectedTemplate.recommended_fields
              .map((field) => recommendedFieldLabels[field] || field)
              .join(" · ")}
          </span>
        </div>
      )}
      {/* Remounts the form when the selected template changes so initial values are reset. */}
      <CommitmentForm
        key={selectedTemplateId || "blank"}
        initialData={templateInitialData}
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