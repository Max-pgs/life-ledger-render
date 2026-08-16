import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import {
    archiveCommitment,
    getCommitments,
    getCommitmentGroups,
    getCommitmentStatuses,
    getArchivedCommitments,
    getCurrentMonthPayments,
    getPaymentHistory,
    restoreCommitment,
    deleteCommitment,
} from "../services/commitmentService";

import "./CommitmentsPage.css";

function CommitmentsPage() {
    const [commitments, setCommitments] = useState([]);
    const [currentMonthPayments, setCurrentMonthPayments] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [groups, setGroups] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const priorityFilter = ["high", "medium", "low"].includes(
        searchParams.get("priority"),
    )
        ? searchParams.get("priority")
        : "";

    const paymentCycleFilter = ["paid", "pending", "overdue"].includes(
        searchParams.get("payment_cycle_status"),
    )
        ? searchParams.get("payment_cycle_status")
        : "";

    const reviewFilter =
        searchParams.get("review") === "needed"
            ? "needed"
            : "";

    const [actionError, setActionError] = useState("");
    const [commitmentToArchive, setCommitmentToArchive] = useState(null);
    const [commitmentToDelete, setCommitmentToDelete] = useState(null);

    const listMode = searchParams.get("view") === "archived" ? "archived" : "current";

    useEffect(() => {
        async function loadCommitmentsForMode(mode) {
            if (mode === "archived") {
                return getArchivedCommitments();
            }

            return getCommitments();
        }

        async function loadPageData() {
            try {
                const [
                    commitmentData,
                    groupData,
                    statusData,
                    currentMonthPaymentData,
                    paymentHistoryData,
                ] = await Promise.all([
                    loadCommitmentsForMode(listMode),
                    getCommitmentGroups(),
                    getCommitmentStatuses(),
                    getCurrentMonthPayments(),
                    getPaymentHistory(),
                ]);

                setCommitments(commitmentData);
                setGroups(groupData);
                setStatuses(statusData);
                setCurrentMonthPayments(currentMonthPaymentData);
                setPaymentHistory(paymentHistoryData);
            } catch {
                setLoadError(
                    "Commitments could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadPageData();
    }, [listMode]);

    /* Formats date-only API values without shifting them across time zones. */
    function formatDate(dateValue) {
        if (!dateValue) {
            return "—";
        }

        return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB");
    }

    function formatPaymentStatus(status) {
        if (!status) {
            return "—";
        }

        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    async function handleArchive() {
        if (!commitmentToArchive) {
            return;
        }

        setActionError("");

        try {
            await archiveCommitment(commitmentToArchive.id);

            setCommitments((current) =>
                current.filter(
                    (item) => item.id !== commitmentToArchive.id,
                ),
            );

            setCommitmentToArchive(null);
        } catch {
            setActionError(
                "Commitment could not be archived. Please try again.",
            );
        }
    }

    async function handleRestore(commitment) {
        setActionError("");

        try {
            await restoreCommitment(commitment.id);

            setCommitments((current) =>
                current.filter((item) => item.id !== commitment.id),
            );
        } catch {
            setActionError(
                "Commitment could not be restored. Please try again.",
            );
        }
    }

    async function handleDelete() {
        if (!commitmentToDelete) {
            return;
        }

        setActionError("");

        try {
            await deleteCommitment(commitmentToDelete.id);

            setCommitments((current) =>
                current.filter(
                    (item) => item.id !== commitmentToDelete.id,
                ),
            );

            setCommitmentToDelete(null);
        } catch {
            setActionError(
                "Commitment could not be deleted. Please try again.",
            );
        }
    }

    if (isLoading) {
        return (
            <section className="commitments-page">
                <p>Loading commitments...</p>
            </section>
        );
    }

    const paymentCycleCommitmentIds = new Set(
        currentMonthPayments
            .filter(
                (payment) =>
                    !paymentCycleFilter ||
                    (payment.effective_status || payment.status) === paymentCycleFilter,
            )
            .map((payment) => payment.commitment_id),
    );

    function getMonthlyPaymentCount(commitmentId, status) {
        return currentMonthPayments.filter(
            (payment) =>
                payment.commitment_id === commitmentId &&
                (payment.effective_status || payment.status) === status,
        ).length;
    }

    function getMonthlyPaymentsForCommitment(commitmentId, status) {
        return currentMonthPayments.filter(
            (payment) =>
                payment.commitment_id === commitmentId &&
                (payment.effective_status || payment.status) === status,
        );
    }

    function getPastPaidPayments(commitmentId) {
        return paymentHistory.filter(
            (payment) =>
                payment.commitment_id === commitmentId &&
                (payment.effective_status || payment.status) === "paid"
        );
    }

    const filteredCommitments = commitments.filter((commitment) => {
        const searchValue = searchQuery.trim().toLowerCase();

        const matchesSearch =
            !searchValue ||
            commitment.title.toLowerCase().includes(searchValue) ||
            commitment.provider_name?.toLowerCase().includes(searchValue);

        const matchesGroup =
            !groupFilter ||
            String(commitment.group?.id) === groupFilter;

        const matchesStatus =
            !statusFilter ||
            String(commitment.status?.id) === statusFilter;

        const matchesPriority =
            !priorityFilter ||
            commitment.priority === priorityFilter;

        const matchesPaymentCycle =
            !paymentCycleFilter ||
            paymentCycleCommitmentIds.has(commitment.id);

        const matchesReview =
            reviewFilter !== "needed" ||
            commitment.review_needed;

        return (
            matchesSearch &&
            matchesGroup &&
            matchesStatus &&
            matchesPriority &&
            matchesPaymentCycle &&
            matchesReview
        );
    });

    return (
        <section className="commitments-page">
            <header className="commitments-page__header">
                <div>
                    <p className="commitments-page__eyebrow">
                        Your commitments
                    </p>

                    <h1>Commitments</h1>

                    <p className="commitments-page__intro">
                        View and manage the commitments you are currently tracking.
                    </p>
                </div>

                <Link
                    className="commitments-page__add"
                    to="/commitments/new"
                >
                    Add commitment
                </Link>
            </header>

            <div className="commitments-page__tabs">
                <button
                    type="button"
                    className={
                        listMode === "current"
                            ? "commitments-page__tab commitments-page__tab--active"
                            : "commitments-page__tab"
                    }
                    onClick={() => {
                        setSearchParams({});
                    }}
                >
                    Current
                </button>

                <button
                    type="button"
                    className={
                        listMode === "archived"
                            ? "commitments-page__tab commitments-page__tab--active"
                            : "commitments-page__tab"
                    }
                    onClick={() => {
                        setSearchParams({ view: "archived" });
                    }}
                >
                    Archived
                </button>
            </div>

            {actionError && (
                <div
                    className="commitments-page__message commitments-page__message--error"
                    role="alert"
                >
                    {actionError}
                </div>
            )}

            {!loadError && commitments.length === 0 && (
                <div className="commitments-page__empty">
                    {listMode === "current" ? (
                        <>
                            <h2>No commitments yet</h2>

                            <p>
                                Add your first commitment to start tracking bills,
                                contracts and important deadlines.
                            </p>

                            <Link to="/commitments/new">
                                Add commitment
                            </Link>
                        </>
                    ) : (
                        <>
                            <h2>No archived commitments</h2>

                            <p>
                                Commitments you archive will appear here.
                            </p>
                        </>
                    )}
                </div>
            )}
            {!loadError && commitments.length > 0 && (
                <>
                    <div className="commitments-toolbar">
                        <div className="commitments-toolbar__field commitments-toolbar__field--search">
                            <label htmlFor="commitment-search">
                                Search
                            </label>

                            <input
                                id="commitment-search"
                                type="search"
                                placeholder="Search commitments..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className="commitments-toolbar__field">
                            <label htmlFor="group-filter">
                                Commitment group
                            </label>

                            <select
                                id="group-filter"
                                value={groupFilter}
                                onChange={(event) => setGroupFilter(event.target.value)}
                            >
                                <option value="">All groups</option>

                                {groups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="commitments-toolbar__field">
                            <label htmlFor="status-filter">
                                Status
                            </label>

                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="">All statuses</option>

                                {statuses.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="commitments-toolbar__field">
                            <label htmlFor="priority-filter">
                                Priority
                            </label>

                            <select
                                id="priority-filter"
                                value={priorityFilter}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    const nextParams = new URLSearchParams(searchParams);

                                    if (value) {
                                        nextParams.set("priority", value);
                                    } else {
                                        nextParams.delete("priority");
                                    }

                                    setSearchParams(nextParams);
                                }}
                            >
                                <option value="">All priorities</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div className="commitments-toolbar__field">
                            <label htmlFor="payment-filter">
                                Payment
                            </label>

                            <select
                                id="payment-filter"
                                value={paymentCycleFilter}
                                onChange={(event) => {
                                    const nextParams = new URLSearchParams(searchParams);
                                    const value = event.target.value;

                                    nextParams.delete("payment_status");

                                    if (value) {
                                        nextParams.set("payment_cycle_status", value);
                                    } else {
                                        nextParams.delete("payment_cycle_status");
                                    }

                                    setSearchParams(nextParams);
                                }}
                            >
                                <option value="">All payments</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="commitments-toolbar__clear"
                            onClick={() => {
                                setSearchQuery("");
                                setGroupFilter("");
                                setStatusFilter("");

                                const nextParams = new URLSearchParams(searchParams);

                                nextParams.delete("payment_status");
                                nextParams.delete("payment_cycle_status");
                                nextParams.delete("priority");
                                nextParams.delete("review");

                                setSearchParams(nextParams);
                            }}
                        >
                            Clear filters
                        </button>
                    </div>
                </>
            )}
            {!loadError &&
                commitments.length > 0 &&
                filteredCommitments.length === 0 && (
                    <div className="commitments-page__empty">
                        <h2>No matching commitments</h2>

                        <p>
                            Try changing your search or filters.
                        </p>
                    </div>
                )}


            {!loadError && filteredCommitments.length > 0 && (
                <div className="commitments-table-wrapper">
                    <div className="commitments-desktop">
                        <div className="commitments-table__summary">
                            Showing {filteredCommitments.length}{" "}
                            {filteredCommitments.length === 1
                                ? "commitment"
                                : "commitments"}
                        </div>

                        <table className="commitments-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Group</th>
                                    <th>Provider</th>
                                    <th>Amount</th>
                                    <th>
                                        {paymentCycleFilter
                                            ? "Current month due"
                                            : "Next due"}
                                    </th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>
                                        {paymentCycleFilter
                                            ? "Current month payment"
                                            : "Payment status"}
                                    </th>
                                    <th>Past payments</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredCommitments.map((commitment) => (
                                    <tr key={commitment.id}>
                                        <td className="commitments-table__title">
                                            {commitment.title}
                                        </td>

                                        <td>
                                            {commitment.group?.name || "—"}
                                        </td>

                                        <td>
                                            {commitment.provider_name || "—"}
                                        </td>

                                        <td>
                                            {commitment.amount
                                                ? `£${Number.parseFloat(commitment.amount).toFixed(2)}`
                                                : "—"}
                                        </td>

                                        <td>
                                            {paymentCycleFilter
                                                ? getMonthlyPaymentsForCommitment(
                                                    commitment.id,
                                                    paymentCycleFilter,
                                                )
                                                    .map((payment) => formatDate(payment.due_date))
                                                    .join(", ")
                                                : formatDate(commitment.due_date)}
                                        </td>

                                        <td>
                                            <span
                                                className={`commitments-table__priority commitments-table__priority--${commitment.priority}`}
                                            >
                                                {commitment.priority}
                                            </span>
                                        </td>

                                        <td>
                                            {commitment.status?.name || "—"}
                                        </td>

                                        <td>
                                            {paymentCycleFilter
                                                ? `${formatPaymentStatus(paymentCycleFilter)}${getMonthlyPaymentCount(
                                                    commitment.id,
                                                    paymentCycleFilter,
                                                ) > 1
                                                    ? ` (${getMonthlyPaymentCount(
                                                        commitment.id,
                                                        paymentCycleFilter,
                                                    )})`
                                                    : ""
                                                }`
                                                : formatPaymentStatus(
                                                    commitment.effective_payment_status
                                                    || commitment.payment_status
                                                )}
                                        </td>

                                        <td>
                                            {(() => {
                                                const pastPayments = getPastPaidPayments(commitment.id);

                                                if (pastPayments.length === 0) {
                                                    return "—";
                                                }

                                                return (
                                                    <div className="commitments-table__past-payments">
                                                        {pastPayments.slice(0, 5).map((payment) => (
                                                            <div
                                                                key={payment.id}
                                                                className="commitments-table__past-payment"
                                                            >
                                                                <span>
                                                                    {formatDate(payment.due_date)}
                                                                </span>

                                                                <strong>
                                                                    {payment.amount
                                                                        ? `£${Number.parseFloat(payment.amount).toFixed(2)}`
                                                                        : "—"}
                                                                </strong>
                                                            </div>
                                                        ))}

                                                        {pastPayments.length > 5 && (
                                                            <Link
                                                                to={`/commitments/${commitment.id}`}
                                                                className="commitments-table__past-more"
                                                            >
                                                                + {pastPayments.length - 5} more
                                                            </Link>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>

                                        <td>
                                            <div className="commitments-table__actions">
                                                <Link
                                                    to={
                                                        listMode === "archived"
                                                            ? `/commitments/${commitment.id}?from=archived`
                                                            : `/commitments/${commitment.id}`
                                                    }
                                                >
                                                    View
                                                </Link>

                                                {listMode === "current" ? (
                                                    <>
                                                        <Link to={`/commitments/${commitment.id}/edit`}>
                                                            Edit
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() => setCommitmentToArchive(commitment)}
                                                        >
                                                            Archive
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRestore(commitment)}
                                                        >
                                                            Restore
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setCommitmentToDelete(commitment)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="commitments-mobile">
                        {filteredCommitments.map((commitment) => (
                            <article
                                className="commitments-mobile-card"
                                key={commitment.id}
                            >
                                <div className="commitments-mobile-card__header">
                                    <div>
                                        <h2>{commitment.title}</h2>

                                        <p>
                                            {commitment.group?.name || "No group"}
                                        </p>
                                    </div>

                                    <span
                                        className={`commitments-table__priority commitments-table__priority--${commitment.priority}`}
                                    >
                                        {commitment.priority}
                                    </span>
                                </div>

                                <dl className="commitments-mobile-card__details">
                                    <div>
                                        <dt>Provider</dt>
                                        <dd>{commitment.provider_name || "—"}</dd>
                                    </div>

                                    <div>
                                        <dt>Amount</dt>
                                        <dd>
                                            {commitment.amount
                                                ? `£${Number.parseFloat(commitment.amount).toFixed(2)}`
                                                : "—"}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            {paymentCycleFilter
                                                ? "Current month due"
                                                : "Next due"}
                                        </dt>
                                        <dd>
                                            {paymentCycleFilter
                                                ? getMonthlyPaymentsForCommitment(
                                                    commitment.id,
                                                    paymentCycleFilter,
                                                )
                                                    .map((payment) => formatDate(payment.due_date))
                                                    .join(", ")
                                                : formatDate(commitment.due_date)}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>Status</dt>
                                        <dd>{commitment.status?.name || "—"}</dd>
                                    </div>

                                    <div>
                                        <dt>
                                            {paymentCycleFilter
                                                ? "Current month payment"
                                                : "Payment"}
                                        </dt>

                                        <dd>
                                            {paymentCycleFilter
                                                ? `${formatPaymentStatus(paymentCycleFilter)}${getMonthlyPaymentCount(
                                                    commitment.id,
                                                    paymentCycleFilter,
                                                ) > 1
                                                    ? ` (${getMonthlyPaymentCount(
                                                        commitment.id,
                                                        paymentCycleFilter,
                                                    )})`
                                                    : ""
                                                }`
                                                : formatPaymentStatus(
                                                    commitment.effective_payment_status
                                                    || commitment.payment_status
                                                )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Past payments</dt>

                                        <dd>
                                            {(() => {
                                                const pastPayments = getPastPaidPayments(commitment.id);

                                                if (pastPayments.length === 0) {
                                                    return "—";
                                                }

                                                return (
                                                    <div className="commitments-mobile-card__past-payments">
                                                        {pastPayments.slice(0, 3).map((payment) => (
                                                            <div
                                                                key={payment.id}
                                                                className="commitments-mobile-card__past-payment"
                                                            >
                                                                <span>
                                                                    {formatDate(payment.due_date)}
                                                                </span>

                                                                <strong>
                                                                    {payment.amount
                                                                        ? `£${Number.parseFloat(payment.amount).toFixed(2)}`
                                                                        : "—"}
                                                                </strong>
                                                            </div>
                                                        ))}

                                                        {pastPayments.length > 3 && (
                                                            <Link
                                                                to={`/commitments/${commitment.id}`}
                                                                className="commitments-mobile-card__past-more"
                                                            >
                                                                + {pastPayments.length - 3} more
                                                            </Link>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="commitments-table__actions">
                                    <Link
                                        to={
                                            listMode === "archived"
                                                ? `/commitments/${commitment.id}?from=archived`
                                                : `/commitments/${commitment.id}`
                                        }
                                    >
                                        View
                                    </Link>

                                    {listMode === "current" ? (
                                        <>
                                            <Link to={`/commitments/${commitment.id}/edit`}>
                                                Edit
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => setCommitmentToArchive(commitment)}
                                            >
                                                Archive
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleRestore(commitment)}
                                            >
                                                Restore
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setCommitmentToDelete(commitment)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {commitmentToArchive && (
                <div
                    className="commitment-modal"
                    role="presentation"
                >
                    <div
                        className="commitment-modal__dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="archive-dialog-title"
                    >
                        <p className="commitment-modal__eyebrow">
                            Archive commitment
                        </p>

                        <h2 id="archive-dialog-title">
                            Archive "{commitmentToArchive.title}"?
                        </h2>

                        <p className="commitment-modal__text">
                            This commitment will be removed from your active list.
                        </p>

                        <div className="commitment-modal__actions">
                            <button
                                type="button"
                                className="commitment-modal__cancel"
                                onClick={() => setCommitmentToArchive(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="commitment-modal__confirm"
                                onClick={handleArchive}
                            >
                                Archive
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {commitmentToDelete && (
                <div
                    className="commitment-modal"
                    role="presentation"
                >
                    <div
                        className="commitment-modal__dialog"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                    >
                        <p className="commitment-modal__eyebrow">
                            Delete commitment
                        </p>

                        <h2 id="delete-dialog-title">
                            Delete "{commitmentToDelete.title}"?
                        </h2>

                        <p className="commitment-modal__text">
                            This action is permanent and cannot be undone.
                        </p>

                        <div className="commitment-modal__actions">
                            <button
                                type="button"
                                className="commitment-modal__cancel"
                                onClick={() => setCommitmentToDelete(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="commitment-modal__delete"
                                onClick={handleDelete}
                            >
                                Delete permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
export default CommitmentsPage;