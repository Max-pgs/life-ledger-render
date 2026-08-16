import { useState } from "react";

import "./FaqPage.css";

const FAQ_SECTIONS = [
    {
        id: "dashboard",
        label: "Dashboard",
    },
    {
        id: "commitments",
        label: "Commitments",
    },
    {
        id: "commitment-form",
        label: "Add / Edit Commitment",
    },
    {
        id: "guided-setup",
        label: "Guided Setup",
    },
    {
        id: "checklist",
        label: "What have I forgotten?",
    },
    {
        id: "guidance",
        label: "UK Guidance",
    },
    {
        id: "settings",
        label: "Settings & Premium",
    },
];

function FaqPage() {
    const [activeSection, setActiveSection] = useState("dashboard");

    return (
        <section className="faq-page">
            <header className="faq-page__header">
                <p>Help</p>

                <h1>Frequently asked questions</h1>

                <p>
                    Choose a Life Ledger page to see a short explanation of how
                    its main features work.
                </p>
            </header>

            <div className="faq-page__layout">
                <nav
                    className="faq-page__navigation"
                    aria-label="FAQ sections"
                >
                    {FAQ_SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            className={`faq-page__navigation-button ${activeSection === section.id
                                ? "faq-page__navigation-button--active"
                                : ""
                                }`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            {section.label}
                        </button>
                    ))}
                </nav>

                <div className="faq-page__content">
                    {activeSection === "dashboard" && (
                        <section className="faq-card">
                            <h2>Dashboard</h2>

                            <div className="faq-item">
                                <h3>What does the dashboard show?</h3>

                                <p>
                                    The dashboard highlights upcoming, overdue, high-priority and
                                    review-needed commitments, together with your current payment
                                    status and progress information.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is shown in each commitment card?</h3>

                                <p>
                                    Dashboard sections show up to five commitments at a time.
                                    A counter such as 5/10 shows how many items are currently
                                    displayed compared with the total number available.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What happens when I choose View all?</h3>

                                <p>
                                    View all opens the Commitments page with the relevant filter
                                    already applied, so you can immediately see the full set of
                                    overdue, high-priority or review-needed commitments.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What makes a commitment overdue?</h3>

                                <p>
                                    A commitment is treated as overdue when its next due date has
                                    passed and its payment status is still Pending or Overdue.
                                    Commitments already marked Paid are not shown as overdue.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What does the payment status chart mean?</h3>

                                <p>
                                    The chart groups commitments by their effective payment status,
                                    such as Paid, Pending and Overdue. Selecting a chart section or
                                    legend item opens the Commitments page filtered to that payment
                                    status.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is Review needed?</h3>

                                <p>
                                    Review needed highlights commitments approaching a calculated
                                    cancellation or review deadline, helping you identify contracts
                                    that may require action soon.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What changes for Premium users?</h3>

                                <p>
                                    Premium users also see additional recurring-cost insights,
                                    extended achievements and a prototype family commitment
                                    overview alongside their personal payment status.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "commitments" && (
                        <section className="faq-card">
                            <h2>Commitments</h2>

                            <div className="faq-item">
                                <h3>How do I find a specific commitment?</h3>

                                <p>
                                    Use the search and filters on the Commitments page to narrow
                                    records by commitment group, lifecycle status, priority or
                                    payment status.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Why did I arrive here with a filter already selected?</h3>

                                <p>
                                    Some dashboard actions open the Commitments page with a filter
                                    already applied. For example, choosing View all from Overdue
                                    shows only overdue commitments until you clear or change the
                                    filter.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is the difference between lifecycle status and payment status?</h3>

                                <p>
                                    Lifecycle status describes the overall state of a commitment,
                                    such as Active or Cancelled. Payment status describes the
                                    current payment cycle, such as Pending, Paid, Overdue or
                                    Not applicable.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What happens when I mark a recurring commitment as Paid?</h3>

                                <p>
                                    For recurring commitments, Life Ledger uses the payment
                                    frequency to move the next due date forward to the next
                                    payment cycle. The completed payment remains represented in
                                    the current payment summary before the commitment returns to
                                    its next pending cycle.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What does payment frequency control?</h3>

                                <p>
                                    Payment frequency describes how often a recurring commitment
                                    is due, such as weekly, monthly, quarterly or annually. It is
                                    used when calculating the next due date after a payment cycle
                                    is completed.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>How do I archive a commitment?</h3>

                                <p>
                                    Open the commitment and choose Archive when you no longer want
                                    it to appear with your active commitments. Archived records are
                                    kept separately so they can still be reviewed.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>How do I permanently delete a commitment?</h3>

                                <p>
                                    A commitment must first be archived. Open the Archived view and
                                    use the Delete action there if you want to remove the record
                                    permanently.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "commitment-form" && (
                        <section className="faq-card">
                            <h2>Add / Edit Commitment</h2>

                            <div className="faq-item">
                                <h3>Do I need to complete every field?</h3>

                                <p>
                                    No. Title, commitment group, priority and lifecycle status
                                    are the main required details. Payment, provider, contract
                                    and date fields can be completed only when they are relevant
                                    to the commitment.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What are Quick Start templates?</h3>

                                <p>
                                    Templates provide suggested starting information for common
                                    UK commitments. Selecting one pre-fills relevant fields, but
                                    you can review and change the information before saving.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is Next due date used for?</h3>

                                <p>
                                    Next due date is the next date when a payment or action is
                                    required. Life Ledger uses this date when showing upcoming
                                    and overdue commitments.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is the cancellation deadline?</h3>

                                <p>
                                    If you provide both a contract end date and a notice period,
                                    Life Ledger calculates the date by which you may need to act
                                    before the contract ends.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What does Payment status mean?</h3>

                                <p>
                                    Payment status records whether a commitment is Pending, Paid,
                                    Overdue or Not applicable. A pending commitment with a past
                                    due date may be treated as overdue automatically.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is Personal / Family commitment type?</h3>

                                <p>
                                    Premium users can preview how commitments could be organised
                                    as personal or shared household items. Family commitments are
                                    a prototype preview and do not provide real multi-user sharing
                                    in this version.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What is AI Quick Add?</h3>

                                <p>
                                    AI Quick Add is a Premium prototype preview showing how a
                                    sentence could be converted into suggested commitment fields.
                                    Real AI extraction is not enabled in this version.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "guided-setup" && (
                        <section className="faq-card">
                            <h2>Guided Setup</h2>

                            <div className="faq-item">
                                <h3>What is Guided Setup?</h3>

                                <p>
                                    Guided Setup asks a short set of questions about your
                                    situation and suggests common UK commitments that may be
                                    relevant to you.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Do I have to add every suggestion?</h3>

                                <p>
                                    No. You choose which suggested commitments you want to add.
                                    Suggestions that are not relevant can simply be left
                                    unselected.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What happens after I start adding suggestions?</h3>

                                <p>
                                    Life Ledger opens each selected template in the Add
                                    Commitment form. After saving one commitment, you continue
                                    to the next selected suggestion.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I skip a suggested commitment?</h3>

                                <p>
                                    Yes. Skip moves to the next selected suggestion without
                                    creating the current commitment.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I leave Guided Setup before finishing?</h3>

                                <p>
                                    Yes. You can exit the setup flow and return to the dashboard.
                                    Commitments that you have already saved remain in your account.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I go back to the previous commitment?</h3>

                                <p>
                                    Yes. While adding commitments through Guided Setup, use Back to
                                    return to the previous selected suggestion and review or change
                                    its details.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "checklist" && (
                        <section className="faq-card">
                            <h2>What have I forgotten?</h2>

                            <div className="faq-item">
                                <h3>What does this page do?</h3>

                                <p>
                                    This Premium feature compares common UK commitment templates
                                    with the commitments you already track and highlights possible
                                    gaps in your life-admin records.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What do Tracked, Missing and Not relevant mean?</h3>

                                <p>
                                    Tracked means you already have a commitment linked to that
                                    template. Missing means it is not currently tracked. Not
                                    relevant means you have chosen to exclude it from your
                                    checklist.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What happens when I choose Add?</h3>

                                <p>
                                    Life Ledger opens the Add Commitment page with the selected
                                    template pre-filled. You can review or change the suggested
                                    information before saving it.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I restore something marked Not relevant?</h3>

                                <p>
                                    Yes. Choose Restore to return the item to the checklist so it
                                    can be considered again.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Why can I not see this page on a Free account?</h3>

                                <p>
                                    What have I forgotten? is a Premium feature. You can activate
                                    the Premium prototype from Settings to access it.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "guidance" && (
                        <section className="faq-card">
                            <h2>UK Guidance</h2>

                            <div className="faq-item">
                                <h3>What is UK Guidance for?</h3>

                                <p>
                                    UK Guidance provides short explanations and trusted external
                                    links for common commitment groups, such as household bills,
                                    transport, insurance and personal administration.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I edit the guidance or links?</h3>

                                <p>
                                    No. Guidance content and external information links are managed
                                    by the Life Ledger administrator so that ordinary users cannot
                                    replace them with unverified information.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What does Last reviewed mean?</h3>

                                <p>
                                    Last reviewed shows when the administrator most recently
                                    checked the guidance information. This helps you understand
                                    how recently the content was reviewed.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Are the guides official advice?</h3>

                                <p>
                                    No. Life Ledger provides practical summaries only. Where
                                    appropriate, use the trusted external links to check the
                                    latest official or specialist information for your situation.
                                </p>
                            </div>
                        </section>
                    )}

                    {activeSection === "settings" && (
                        <section className="faq-card">
                            <h2>Settings & Premium</h2>

                            <div className="faq-item">
                                <h3>What can I manage in Settings?</h3>

                                <p>
                                    Settings shows your account information, current plan and
                                    session controls. You can also activate or cancel the Premium
                                    prototype and permanently delete your account.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Is the Premium upgrade a real payment?</h3>

                                <p>
                                    No. Premium activation is a mock payment flow created for this
                                    prototype. It changes your Life Ledger account plan but does
                                    not charge money or connect to a real payment provider.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What becomes available with Premium?</h3>

                                <p>
                                    Premium provides access to What have I forgotten?, additional
                                    dashboard insights and achievements, and prototype previews
                                    for family commitments and AI Quick Add.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Are Family commitments fully implemented?</h3>

                                <p>
                                    No. Personal and Family commitment types and the family
                                    dashboard are prototype previews. Real multi-user household
                                    sharing is not enabled in this version.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Is AI Quick Add fully implemented?</h3>

                                <p>
                                    No. AI Quick Add demonstrates how free-text information could
                                    be converted into suggested commitment fields. Real AI
                                    processing is outside the implemented prototype.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>Can I return from Premium to Free?</h3>

                                <p>
                                    Yes. Premium users can choose Cancel Premium in Settings.
                                    Their account returns to the Free plan and Premium-only
                                    features are hidden.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>How do I permanently delete my account?</h3>

                                <p>
                                    Open the Delete account section in Settings. For safety, you
                                    must type the requested confirmation text in the format
                                    delete_yourusername before permanent deletion is enabled.
                                </p>
                            </div>

                            <div className="faq-item">
                                <h3>What happens after I delete my account?</h3>

                                <p>
                                    Your account and associated Life Ledger data are permanently
                                    deleted. You are then returned to the registration page with a
                                    confirmation message.
                                </p>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </section>
    );
}

export default FaqPage;