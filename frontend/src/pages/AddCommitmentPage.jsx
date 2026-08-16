import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import CommitmentForm from "../components/CommitmentForm";
import { getAccount } from "../services/authService";

import {
  createCommitment,
  getCommitment,
  getCommitmentGroups,
  getCommitmentStatuses,
  getCommitmentTemplates,
  updateCommitment,
} from "../services/commitmentService";

import "./AddCommitmentPage.css";

function AddCommitmentPage() {
  const [groups, setGroups] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [openTemplateGroupId, setOpenTemplateGroupId] = useState("");
  const [accountPlan, setAccountPlan] = useState(null);
  const [aiQuickAddText, setAiQuickAddText] = useState("");
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [existingGuidedCommitment, setExistingGuidedCommitment] = useState(null);
  const [isLoadingGuidedCommitment, setIsLoadingGuidedCommitment] = useState(false);

  const pageHeadingRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const guidedSetupTemplateIds = location.state?.guidedSetupTemplateIds || [];
  const guidedSetupIndex = location.state?.guidedSetupIndex || 0;
  const checklistTemplateId = location.state?.checklistTemplateId || "";
  const guidedSetupCommitmentIds = location.state?.guidedSetupCommitmentIds || {};
  const isGuidedSetup = guidedSetupTemplateIds.length > 0;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    guidedSetupTemplateIds[guidedSetupIndex] ||
    checklistTemplateId ||
    "",
  );
  const existingGuidedCommitmentId =
    isGuidedSetup
      ? guidedSetupCommitmentIds[selectedTemplateId]
      : null;

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

  useEffect(() => {
    async function loadAccountPlan() {
      try {
        const account = await getAccount();
        setAccountPlan(account.plan);
      } catch {
        setAccountPlan(null);
      }
    }

    loadAccountPlan();
  }, []);

  useEffect(() => {
    async function loadExistingGuidedCommitment() {
      if (!existingGuidedCommitmentId) {
        setExistingGuidedCommitment(null);
        return;
      }

      setIsLoadingGuidedCommitment(true);

      try {
        const commitment = await getCommitment(
          existingGuidedCommitmentId,
        );

        setExistingGuidedCommitment(commitment);
      } catch {
        setLoadError(
          "The previously added commitment could not be loaded. Please try again.",
        );
      } finally {
        setIsLoadingGuidedCommitment(false);
      }
    }

    loadExistingGuidedCommitment();
  }, [existingGuidedCommitmentId]);

  function focusPageHeading() {
    requestAnimationFrame(() => {
      pageHeadingRef.current?.focus();
      pageHeadingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function handleCreateCommitment(payload) {
    const savedCommitment = existingGuidedCommitment
      ? await updateCommitment(
        existingGuidedCommitment.id,
        {
          ...payload,
          template_id: selectedTemplateId || null,
        },
      )
      : await createCommitment({
        ...payload,
        template_id: selectedTemplateId || null,
      });

    const updatedGuidedSetupCommitmentIds = {
      ...guidedSetupCommitmentIds,
      [selectedTemplateId]: savedCommitment.id,
    };

    if (isGuidedSetup) {
      const nextIndex = guidedSetupIndex + 1;

      if (nextIndex < guidedSetupTemplateIds.length) {
        const nextTemplateId = guidedSetupTemplateIds[nextIndex];

        setSelectedTemplateId(nextTemplateId);

        navigate("/commitments/new", {
          replace: true,
          state: {
            guidedSetupTemplateIds,
            guidedSetupIndex: nextIndex,
            guidedSetupCommitmentIds: updatedGuidedSetupCommitmentIds,
          },
        });

        focusPageHeading();

        return;
      }

      navigate("/guided-setup", {
        state: {
          guidedSetupComplete: true,
        },
      });

      return;
    }

    navigate("/commitments");
  }

  function handlePreviousGuidedTemplate() {
    if (guidedSetupIndex <= 0) {
      return;
    }

    const previousIndex = guidedSetupIndex - 1;
    const previousTemplateId = guidedSetupTemplateIds[previousIndex];

    setSelectedTemplateId(previousTemplateId);

    navigate("/commitments/new", {
      replace: true,
      state: {
        guidedSetupTemplateIds,
        guidedSetupIndex: previousIndex,
        guidedSetupCommitmentIds,
      },
    });
    focusPageHeading();
  }

  function handleSkipGuidedTemplate() {
    const nextIndex = guidedSetupIndex + 1;

    if (nextIndex < guidedSetupTemplateIds.length) {
      const nextTemplateId = guidedSetupTemplateIds[nextIndex];

      setSelectedTemplateId(nextTemplateId);

      navigate("/commitments/new", {
        replace: true,
        state: {
          guidedSetupTemplateIds,
          guidedSetupIndex: nextIndex,
          guidedSetupCommitmentIds,
        },
      });

      focusPageHeading();

      return;
    }

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

          <h1
            ref={pageHeadingRef}
            tabIndex="-1"
          >
            Add commitment
          </h1>

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

      {isGuidedSetup && (
        <div className="guided-setup-add-progress">
          <div>
            <p className="guided-setup-add-progress__eyebrow">
              Guided setup
            </p>

            <h2>
              Adding {guidedSetupIndex + 1} of{" "}
              {guidedSetupTemplateIds.length}
            </h2>
          </div>

          <div className="guided-setup-add-progress__actions">
            <button
              type="button"
              onClick={handlePreviousGuidedTemplate}
              disabled={guidedSetupIndex === 0}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSkipGuidedTemplate}
            >
              Skip
            </button>

            <button
              type="button"
              className="guided-setup-add-progress__exit"
              onClick={() => navigate("/dashboard")}
            >
              Exit setup
            </button>
          </div>
        </div>
      )}
      {accountPlan === "premium" && !isGuidedSetup && (
        <section className="ai-quick-add-preview">
          <div className="ai-quick-add-preview__header">
            <div>
              <p className="ai-quick-add-preview__eyebrow">
                Premium preview
              </p>

              <h2>AI Quick Add</h2>

              <p>
                Describe a commitment in one sentence to preview how
                Life Ledger could suggest structured fields.
              </p>
            </div>
          </div>

          <textarea
            value={aiQuickAddText}
            onChange={(event) => {
              setAiQuickAddText(event.target.value);
              setShowAiSuggestions(false);
            }}
            placeholder="e.g. My Vodafone contract is £32 per month and renews on 15 October."
            rows="3"
          />

          <button
            type="button"
            onClick={() => setShowAiSuggestions(true)}
            disabled={!aiQuickAddText.trim()}
          >
            Generate suggestions
          </button>

          {showAiSuggestions && (
            <div className="ai-quick-add-preview__suggestions">
              <p className="ai-quick-add-preview__suggestions-label">
                Example suggested fields
              </p>

              <dl>
                <div>
                  <dt>Title</dt>
                  <dd>Mobile phone contract</dd>
                </div>

                <div>
                  <dt>Provider</dt>
                  <dd>Vodafone</dd>
                </div>

                <div>
                  <dt>Amount</dt>
                  <dd>£32.00</dd>
                </div>

                <div>
                  <dt>Frequency</dt>
                  <dd>Monthly</dd>
                </div>

                <div>
                  <dt>Renewal date</dt>
                  <dd>15 October</dd>
                </div>
              </dl>

              <p className="ai-quick-add-preview__note">
                This is an interactive Premium prototype preview.
                AI-generated field extraction is not enabled in this version.
              </p>
            </div>
          )}
        </section>
      )}
      {!isGuidedSetup && (
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
      )}
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
      {isLoadingGuidedCommitment && (
        <p className="add-commitment-page__loading">
          Loading commitment...
        </p>
      )}
      {!isLoadingGuidedCommitment && (
        <CommitmentForm
          key={
            existingGuidedCommitment
              ? `commitment-${existingGuidedCommitment.id}`
              : selectedTemplateId || "blank"
          }
          initialData={
            existingGuidedCommitment
              ? {
                title: existingGuidedCommitment.title || "",
                group_id: existingGuidedCommitment.group?.id || "",
                provider_name: existingGuidedCommitment.provider_name || "",
                amount: existingGuidedCommitment.amount || "",
                payment_frequency:
                  existingGuidedCommitment.payment_frequency || "",
                payment_status:
                  existingGuidedCommitment.payment_status || "not_applicable",
                contract_end_date:
                  existingGuidedCommitment.contract_end_date || "",
                notice_period_days:
                  existingGuidedCommitment.notice_period_days || "",
                due_date: existingGuidedCommitment.due_date || "",
                renewal_date: existingGuidedCommitment.renewal_date || "",
                priority: existingGuidedCommitment.priority || "",
                status_id: existingGuidedCommitment.status?.id || "",
                notes: existingGuidedCommitment.notes || "",
              }
              : templateInitialData
          }
          groups={groups}
          statuses={statuses}
          accountPlan={accountPlan}
          onSubmit={handleCreateCommitment}
          onCancel={() => navigate("/commitments")}
          submitLabel={
            existingGuidedCommitment
              ? "Update commitment"
              : "Add commitment"
          }
          submittingLabel={
            existingGuidedCommitment
              ? "Updating commitment..."
              : "Adding commitment..."
          }
          loadError={loadError}
        />
      )}
    </section>
  );
}

export default AddCommitmentPage;