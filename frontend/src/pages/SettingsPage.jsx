import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
    deleteAccount,
    getAccount,
    logoutUser,
    upgradeToPremium,
    cancelPremium,
} from "../services/authService";

import "./SettingsPage.css";

function SettingsPage() {
    const [account, setAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeMessage, setUpgradeMessage] = useState("");
    const [isCancellingPremium, setIsCancellingPremium] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function loadAccount() {
            try {
                const data = await getAccount();
                setAccount(data);
            } catch {
                setLoadError(
                    "Your account information could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadAccount();
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } finally {
            localStorage.removeItem("authToken");
            navigate("/login");
        }
    }

    async function handleUpgradeToPremium() {
        setIsUpgrading(true);
        setUpgradeMessage("");

        try {
            const data = await upgradeToPremium();

            setAccount((currentAccount) => ({
                ...currentAccount,
                plan: data.plan,
            }));

            window.dispatchEvent(
                new CustomEvent("account-plan-changed", {
                    detail: {
                        plan: data.plan,
                    },
                }),
            );

            setUpgradeMessage(
                data.message || "Mock payment successful. Your account is now Premium.",
            );

            setShowPremiumModal(false);
        } catch {
            setUpgradeMessage(
                "Premium upgrade could not be completed. Please try again.",
            );
        } finally {
            setIsUpgrading(false);
        }
    }

    async function handleCancelPremium() {
        setIsCancellingPremium(true);
        setUpgradeMessage("");

        try {
            const data = await cancelPremium();

            setAccount((currentAccount) => ({
                ...currentAccount,
                plan: data.plan,
            }));

            window.dispatchEvent(
                new CustomEvent("account-plan-changed", {
                    detail: {
                        plan: data.plan,
                    },
                }),
            );

            setUpgradeMessage(
                data.message || "Your account is now using the Free plan.",
            );
        } catch {
            setUpgradeMessage(
                "Premium cancellation could not be completed. Please try again.",
            );
        } finally {
            setIsCancellingPremium(false);
        }
    }

    async function handleDeleteAccount() {
        setIsDeleting(true);

        try {
            await deleteAccount(deleteConfirmation);
            localStorage.removeItem("authToken");

            navigate("/register", {
                state: {
                    accountDeleted: true,
                },
            });
        } catch {
            setLoadError(
                "Your account could not be deleted. Please try again.",
            );
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="settings-page">
                <p>Loading settings...</p>
            </section>
        );
    }

    if (loadError && !account) {
        return (
            <section className="settings-page">
                <p>{loadError}</p>
            </section>
        );
    }

    const memberSince = account?.member_since
        ? new Date(account.member_since).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Not available";

    const planLabel =
        account?.plan === "premium" ? "Premium" : "Free";

    return (
        <section className="settings-page">
            <header className="settings-page__header">
                <p>Account settings</p>
                <h1>Settings</h1>
                <p>
                    Manage your Life Ledger account, subscription plan and session.
                </p>
            </header>

            {loadError && (
                <p className="settings-page__error">{loadError}</p>
            )}

            {upgradeMessage && (
                <p className="settings-page__success" role="status">
                    {upgradeMessage}
                </p>
            )}

            <section className="settings-card">
                <div className="settings-card__header">
                    <div>
                        <p>Profile</p>
                        <h2>Account information</h2>
                    </div>
                </div>

                <dl className="settings-details">
                    <div>
                        <dt>Username</dt>
                        <dd>{account.username}</dd>
                    </div>

                    <div>
                        <dt>Email</dt>
                        <dd>{account.email}</dd>
                    </div>

                    <div>
                        <dt>Member since</dt>
                        <dd>{memberSince}</dd>
                    </div>
                </dl>
            </section>

            <section className="settings-card settings-card--plan">
                <div className="settings-card__header">
                    <div>
                        <p>Membership</p>
                        <h2>Your plan</h2>
                    </div>

                    <span className="settings-plan-badge">
                        {planLabel}
                    </span>
                </div>

                <p className="settings-card__description">
                    {account.plan === "premium"
                        ? "Your account has access to Premium Life Ledger features."
                        : "You are currently using the Free Life Ledger plan."}
                </p>

                <div className="settings-plan-features">
                    <article className="settings-plan-feature">
                        <div>
                            <span className="settings-plan-feature__label">
                                Premium
                            </span>
                            <h3>What have I forgotten?</h3>
                        </div>

                        <p>
                            Check common UK commitments that you may not yet be tracking
                            and mark items as tracked or not relevant.
                        </p>
                    </article>

                    <article className="settings-plan-feature">
                        <div>
                            <span className="settings-plan-feature__label">
                                Future Premium
                            </span>
                            <h3>Family commitments</h3>
                        </div>

                        <p>
                            Preview tools for organising personal and shared household
                            commitments, including a separate family dashboard overview.
                        </p>
                    </article>

                    <article className="settings-plan-feature">
                        <div>
                            <span className="settings-plan-feature__label">
                                Future Premium
                            </span>
                            <h3>AI Quick Add</h3>
                        </div>

                        <p>
                            Turn a sentence into suggested commitment details, then review
                            and confirm the fields before saving.
                        </p>
                    </article>

                    <article className="settings-plan-feature">
                        <div>
                            <span className="settings-plan-feature__label">
                                Future Premium
                            </span>
                            <h3>Advanced dashboard insights</h3>
                        </div>

                        <p>
                            See deeper patterns across recurring costs, upcoming deadlines
                            and the commitment groups that make up your life admin.
                        </p>
                    </article>

                    <article className="settings-plan-feature">
                        <div>
                            <span className="settings-plan-feature__label">
                                Premium
                            </span>
                            <h3>Extended achievements</h3>
                        </div>

                        <p>
                            Unlock additional progress milestones for reviewing and keeping
                            your commitments organised.
                        </p>
                    </article>
                </div>

                {account.plan !== "premium" ? (
                    <button
                        type="button"
                        className="settings-button settings-button--primary"
                        onClick={() => setShowPremiumModal(true)}
                    >
                        Upgrade to Premium
                    </button>
                ) : (
                    <button
                        type="button"
                        className="settings-button"
                        onClick={handleCancelPremium}
                        disabled={isCancellingPremium}
                    >
                        {isCancellingPremium
                            ? "Cancelling..."
                            : "Cancel Premium"}
                    </button>
                )}

            </section>

            <section className="settings-card">
                <div className="settings-card__header">
                    <div>
                        <p>Session</p>
                        <h2>Sign out</h2>
                    </div>
                </div>

                <p className="settings-card__description">
                    Sign out of Life Ledger on this device.
                </p>

                <button
                    type="button"
                    className="settings-button"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </section>

            <section className="settings-card settings-card--danger">
                <div className="settings-card__header">
                    <div>
                        <p>Danger zone</p>
                        <h2>Delete account</h2>
                    </div>
                </div>

                <p className="settings-card__description">
                    Permanently delete your account and all commitments associated
                    with it. This action cannot be cancelled.
                </p>

                <button
                    type="button"
                    className="settings-button settings-button--danger"
                    onClick={() => {
                        setShowDeleteModal(true);
                        setDeleteConfirmation("");
                    }}
                >
                    Delete account
                </button>
            </section>

            {showPremiumModal && (
                <div
                    className="settings-modal-backdrop"
                    role="presentation"
                >
                    <div
                        className="settings-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="premium-modal-title"
                    >
                        <h2 id="premium-modal-title">Life Ledger Premium</h2>

                        <p>
                            Premium is planned to provide additional tools for users who want
                            faster data entry, deeper insights and more detailed progress
                            tracking.
                        </p>

                        <div className="settings-premium-modal__features">
                            <div>
                                <strong>What have I forgotten?</strong>
                                <span>
                                    Check common UK commitments that you may not yet be tracking
                                    and mark items as tracked or not relevant.
                                </span>
                            </div>

                            <div>
                                <strong>Family commitments</strong>
                                <span>
                                    Preview personal and shared household commitments with
                                    a separate family dashboard overview.
                                </span>
                            </div>

                            <div>
                                <strong>AI Quick Add</strong>
                                <span>
                                    Preview how a sentence could be turned into suggested
                                    commitment fields before saving.
                                </span>
                            </div>

                            <div>
                                <strong>Advanced dashboard insights</strong>
                                <span>
                                    Explore additional summaries based on recurring costs,
                                    deadlines and commitment groups.
                                </span>
                            </div>

                            <div>
                                <strong>Extended achievements</strong>
                                <span>
                                    Unlock additional organisation and review milestones.
                                </span>
                            </div>
                        </div>

                        <p className="settings-premium-modal__note">
                            Premium billing is not available in this prototype. Some Premium
                            features are presented as interactive previews rather than fully
                            implemented multi-user or AI functionality.
                        </p>

                        <div className="settings-modal__actions">
                            <button
                                type="button"
                                className="settings-button"
                                onClick={() => setShowPremiumModal(false)}
                                disabled={isUpgrading}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="settings-button settings-button--primary"
                                onClick={handleUpgradeToPremium}
                                disabled={isUpgrading}
                            >
                                {isUpgrading ? "Processing..." : "Complete mock upgrade"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="settings-modal-backdrop"
                    role="presentation"
                >
                    <div
                        className="settings-modal settings-modal--danger"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                    >
                        <h2 id="delete-modal-title">Delete your account?</h2>

                        <p>
                            Your commitments and account information will be
                            permanently deleted. This cannot be undone.
                        </p>

                        <p>
                            To confirm, type <strong>delete_{account.username}</strong> below.
                        </p>

                        <label
                            className="settings-modal__confirmation"
                            htmlFor="delete-account-confirmation"
                        >
                            Confirmation
                            <input
                                id="delete-account-confirmation"
                                type="text"
                                value={deleteConfirmation}
                                onChange={(event) => setDeleteConfirmation(event.target.value)}
                                autoComplete="off"
                            />
                        </label>

                        <div className="settings-modal__actions">
                            <button
                                type="button"
                                className="settings-button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="settings-button settings-button--danger"
                                onClick={handleDeleteAccount}
                                disabled={
                                    isDeleting ||
                                    deleteConfirmation !== `delete_${account.username}`
                                }
                            >
                                {isDeleting ? "Deleting..." : "Delete account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default SettingsPage;