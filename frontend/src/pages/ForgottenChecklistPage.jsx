import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
    getForgottenChecklist,
    markChecklistTemplateNotRelevant,
    restoreChecklistTemplate,
} from "../services/commitmentService";

import "./ForgottenChecklistPage.css";

function ForgottenChecklistPage() {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const navigate = useNavigate();

    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        async function loadChecklist() {
            try {
                const data = await getForgottenChecklist();
                setTemplates(data);
            } catch {
                setLoadError(
                    "Your checklist could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadChecklist();
    }, []);

    async function handleNotRelevant(templateId) {
        try {
            await markChecklistTemplateNotRelevant(templateId);

            setTemplates((currentTemplates) =>
                currentTemplates.map((template) =>
                    template.id === templateId
                        ? {
                            ...template,
                            checklist_status: "not_relevant",
                        }
                        : template,
                ),
            );
        } catch {
            setLoadError(
                "The checklist could not be updated. Please try again.",
            );
        }
    }

    async function handleRestore(templateId) {
        try {
            await restoreChecklistTemplate(templateId);

            setTemplates((currentTemplates) =>
                currentTemplates.map((template) =>
                    template.id === templateId
                        ? {
                            ...template,
                            checklist_status: "missing",
                        }
                        : template,
                ),
            );
        } catch {
            setLoadError(
                "The checklist could not be updated. Please try again.",
            );
        }
    }

    if (isLoading) {
        return (
            <section className="forgotten-checklist-page">
                <p>Loading checklist...</p>
            </section>
        );
    }

    if (loadError && templates.length === 0) {
        return (
            <section className="forgotten-checklist-page">
                <p>{loadError}</p>
            </section>
        );
    }

    const reviewedCount = templates.filter(
        (template) => template.checklist_status !== "missing",
    ).length;

    const missingCount = templates.filter(
        (template) => template.checklist_status === "missing",
    ).length;

    const visibleTemplates =
        activeFilter === "missing"
            ? templates.filter(
                (template) => template.checklist_status === "missing",
            )
            : templates;

    const groupedTemplates = visibleTemplates.reduce(
        (groups, template) => {
            const groupName = template.group_name || "Other";

            if (!groups[groupName]) {
                groups[groupName] = [];
            }

            groups[groupName].push(template);

            return groups;
        },
        {},
    );

    if (!isLoading && templates.length === 0 && !loadError) {
        return (
            <section className="forgotten-checklist-page">
                <header>
                    <p>Life admin checklist</p>
                    <h1>What have I forgotten?</h1>
                    <p>
                        Review common UK commitments and identify anything you may
                        still need to track.
                    </p>
                </header>

                <div className="forgotten-checklist-empty">
                    <h2>No checklist items available</h2>
                    <p>
                        There are currently no active commitment templates to review.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="forgotten-checklist-page">
            <header>
                <p>Life admin checklist</p>

                <h1>What have I forgotten?</h1>

                <p>
                    Review common UK commitments and identify anything you may
                    still need to track.
                </p>
            </header>

            {loadError && <p>{loadError}</p>}

            <div className="forgotten-checklist-summary">
                <div>
                    <strong>{reviewedCount} of {templates.length}</strong>
                    <span>common commitments reviewed</span>
                </div>

                <div>
                    <strong>{missingCount}</strong>
                    <span>still worth reviewing</span>
                </div>
            </div>

            <div className="forgotten-checklist-filters">
                <button
                    type="button"
                    className={
                        activeFilter === "all"
                            ? "forgotten-checklist-filter is-active"
                            : "forgotten-checklist-filter"
                    }
                    onClick={() => setActiveFilter("all")}
                >
                    All
                </button>

                <button
                    type="button"
                    className={
                        activeFilter === "missing"
                            ? "forgotten-checklist-filter is-active"
                            : "forgotten-checklist-filter"
                    }
                    onClick={() => setActiveFilter("missing")}
                >
                    Missing only
                </button>
            </div>

            <div className="forgotten-checklist-groups">
                {Object.entries(groupedTemplates).map(
                    ([groupName, groupTemplates]) => (
                        <section
                            key={groupName}
                            className="forgotten-checklist-group"
                        >
                            <header className="forgotten-checklist-group__header">
                                <div>
                                    <p>Commitment group</p>
                                    <h2>{groupName}</h2>
                                </div>

                                <span>
                                    {
                                        groupTemplates.filter(
                                            (template) =>
                                                template.checklist_status === "missing",
                                        ).length
                                    }{" "}
                                    to review
                                </span>
                            </header>

                            <div className="forgotten-checklist-group__items">
                                {groupTemplates.map((template) => (
                                    <article key={template.id}>
                                        <div>
                                            <p>{template.group_name}</p>
                                            <h2>{template.name}</h2>

                                            {template.description && (
                                                <p>{template.description}</p>
                                            )}
                                        </div>

                                        <div>
                                            {template.checklist_status === "tracked" && (
                                                <span className="forgotten-checklist-status forgotten-checklist-status--tracked">
                                                    Tracked
                                                </span>
                                            )}

                                            {template.checklist_status === "missing" && (
                                                <>
                                                    <span className="forgotten-checklist-status forgotten-checklist-status--missing">
                                                        Missing
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate("/commitments/new", {
                                                                state: {
                                                                    checklistTemplateId: template.id,
                                                                },
                                                            })
                                                        }
                                                    >
                                                        Add
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleNotRelevant(template.id)
                                                        }
                                                    >
                                                        Not relevant
                                                    </button>
                                                </>
                                            )}

                                            {template.checklist_status === "not_relevant" && (
                                                <>
                                                    <span className="forgotten-checklist-status forgotten-checklist-status--not-relevant">
                                                        Not relevant
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(template.id)}
                                                    >
                                                        Restore
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    ),
                )}
            </div>
        </section>
    );
}

export default ForgottenChecklistPage;