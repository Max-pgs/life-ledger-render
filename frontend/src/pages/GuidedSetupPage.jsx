import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { getGuidedSetup } from "../services/commitmentService";

import "./GuidedSetupPage.css";

const setupQuestions = [
    {
        id: "renting",
        question: "Do you rent your home?",
    },
    {
        id: "councilTax",
        question: "Do you pay Council Tax?",
    },
    {
        id: "energy",
        question: "Do you manage household energy bills?",
    },
    {
        id: "communications",
        question: "Do you have broadband or a mobile contract?",
    },
    {
        id: "vehicle",
        question: "Do you own or use a car?",
    },
    {
        id: "insurance",
        question: "Do you have insurance policies?",
    },
    {
        id: "subscriptions",
        question: "Do you pay for subscriptions or memberships?",
    },
    {
        id: "documents",
        question: "Do you want to track important personal documents?",
    },
];

const questionTemplateNames = {
    renting: [
        "Rent",
    ],
    councilTax: [
        "Council Tax",
    ],
    energy: [
        "Energy bill",
    ],
    communications: [
        "Broadband",
        "Mobile phone",
    ],
    vehicle: [
        "Car insurance",
        "MOT",
        "Breakdown cover",
    ],
    insurance: [
        "Home insurance",
        "Pet insurance",
    ],
    subscriptions: [
        "Gym membership",
        "Streaming subscription",
    ],
    documents: [
        "Passport renewal",
        "Driving licence renewal",
    ],
};

function GuidedSetupPage() {
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(1);
    const [guidedGroups, setGuidedGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    const guidedSetupComplete = location.state?.guidedSetupComplete === true;

    useEffect(() => {
        async function loadGuidedSetup() {
            try {
                const data = await getGuidedSetup();
                setGuidedGroups(data);
            } catch {
                setLoadError(
                    "Guided setup could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadGuidedSetup();
    }, []);

    function handleAnswer(questionId, value) {
        setAnswers((currentAnswers) => ({
            ...currentAnswers,
            [questionId]: value,
        }));
    }

    const allQuestionsAnswered = setupQuestions.every(
        (question) => answers[question.id] !== undefined,
    );

    const selectedTemplateNames = Object.entries(answers)
        .filter(([, answer]) => answer === true)
        .flatMap(
            ([questionId]) => questionTemplateNames[questionId] || [],
        );

    const suggestedTemplates = guidedGroups
        .flatMap((group) => group.templates)
        .filter((template) =>
            selectedTemplateNames.includes(template.name),
        );

    const selectedTemplates = suggestedTemplates.filter(
        (template) => selectedTemplateIds.includes(template.id),
    );

    function toggleTemplate(templateId) {
        setSelectedTemplateIds((currentIds) =>
            currentIds.includes(templateId)
                ? currentIds.filter((id) => id !== templateId)
                : [...currentIds, templateId],
        );
    }

    if (isLoading) {
        return (
            <section className="guided-setup-page">
                <p>Loading guided setup...</p>
            </section>
        );
    }

    if (loadError) {
        return (
            <section className="guided-setup-page">
                <p>{loadError}</p>
            </section>
        );
    }

    if (guidedSetupComplete) {
        return (
            <section className="guided-setup-page">
                <div className="guided-setup-card guided-setup-card--complete">
                    <div className="guided-setup-card__header">
                        <p className="guided-setup-page__eyebrow">
                            Guided setup
                        </p>

                        <h1>Guided setup complete</h1>

                        <p>
                            Your selected commitments have been added.
                            You can run guided setup again at any time.
                        </p>
                    </div>

                    <div className="guided-setup-card__footer">
                        <button
                            type="button"
                            className="guided-setup-back"
                            onClick={() => navigate("/dashboard")}
                        >
                            Go to dashboard
                        </button>

                        <button
                            type="button"
                            className="guided-setup-next"
                            onClick={() =>
                                navigate("/guided-setup", {
                                    replace: true,
                                    state: {},
                                })
                            }
                        >
                            Run guided setup again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="guided-setup-page">
            <header className="guided-setup-page__header">
                <p className="guided-setup-page__eyebrow">
                    Guided setup
                </p>

                <h1>What do you need to keep track of?</h1>

                <p>
                    Answer a few questions about your situation and Life Ledger
                    will suggest common UK commitments that may be relevant to you.
                </p>
            </header>

            <div className="guided-setup-progress">
                <span
                    className={`guided-setup-progress__step ${step === 1 ? "guided-setup-progress__step--active" : ""
                        }`}
                >
                    1
                </span>

                <span className="guided-setup-progress__line" />

                <span
                    className={`guided-setup-progress__step ${step === 2 ? "guided-setup-progress__step--active" : ""
                        }`}
                >
                    2
                </span>

                <span className="guided-setup-progress__line" />

                <span
                    className={`guided-setup-progress__step ${step === 3 ? "guided-setup-progress__step--active" : ""
                        }`}
                >
                    3
                </span>
            </div>

            {step === 1 && (
                <div className="guided-setup-card">
                    <div className="guided-setup-card__header">
                        <span>Step 1 of 3</span>
                        <h2>Your situation</h2>
                        <p>
                            Select the answer that best matches your current situation.
                        </p>
                    </div>

                    <div className="guided-setup-questions">
                        {setupQuestions.map((question) => (
                            <div
                                key={question.id}
                                className="guided-setup-question"
                            >
                                <span className="guided-setup-question__text">
                                    {question.question}
                                </span>

                                <div className="guided-setup-question__actions">
                                    <button
                                        type="button"
                                        className={
                                            answers[question.id] === true
                                                ? "guided-setup-answer guided-setup-answer--selected"
                                                : "guided-setup-answer"
                                        }
                                        onClick={() =>
                                            handleAnswer(question.id, true)
                                        }
                                    >
                                        Yes
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            answers[question.id] === false
                                                ? "guided-setup-answer guided-setup-answer--selected"
                                                : "guided-setup-answer"
                                        }
                                        onClick={() =>
                                            handleAnswer(question.id, false)
                                        }
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="guided-setup-card__footer">
                        <button
                            type="button"
                            className="guided-setup-next"
                            disabled={!allQuestionsAnswered}
                            onClick={() => setStep(2)}
                        >
                            Review suggestions
                        </button>
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="guided-setup-card">
                    <div className="guided-setup-card__header">
                        <span>Step 2 of 3</span>
                        <h2>Review suggestions</h2>
                        <p>
                            Select the commitments you would like to add.
                        </p>
                    </div>

                    {suggestedTemplates.length > 0 ? (
                        <div className="guided-setup-suggestions">
                            {suggestedTemplates.map((template) => (
                                <label
                                    key={template.id}
                                    className="guided-setup-suggestion"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTemplateIds.includes(template.id)}
                                        onChange={() => toggleTemplate(template.id)}
                                    />

                                    <div>
                                        <strong>{template.name}</strong>
                                        <p>{template.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <p className="guided-setup-empty">
                            No templates were suggested from your answers.
                        </p>
                    )}

                    <div className="guided-setup-card__footer">
                        <button
                            type="button"
                            className="guided-setup-back"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </button>

                        <button
                            type="button"
                            className="guided-setup-next"
                            disabled={selectedTemplateIds.length === 0}
                            onClick={() =>
                                navigate("/commitments/new", {
                                    state: {
                                        guidedSetupTemplateIds: selectedTemplates.map(
                                            (template) => template.id,
                                        ),
                                        guidedSetupIndex: 0,
                                    },
                                })
                            }
                        >
                            Add selected commitments
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default GuidedSetupPage;