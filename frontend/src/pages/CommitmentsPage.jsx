import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
    getCommitments,
    getCommitmentGroups,
    getCommitmentStatuses,
} from "../services/commitmentService";

import "./CommitmentsPage.css";

function CommitmentsPage() {
    const [commitments, setCommitments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [groups, setGroups] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

    useEffect(() => {
        async function loadPageData() {
            try {
                const [
                    commitmentData,
                    groupData,
                    statusData,
                ] = await Promise.all([
                    getCommitments(),
                    getCommitmentGroups(),
                    getCommitmentStatuses(),
                ]);

                setCommitments(commitmentData);
                setGroups(groupData);
                setStatuses(statusData);
            } catch {
                setLoadError(
                    "Commitments could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadPageData();
    }, []);

    /* Formats date-only API values without shifting them across time zones. */
    function formatDate(dateValue) {
        if (!dateValue) {
            return "—";
        }

        return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-GB");
    }

    if (isLoading) {
        return (
            <section className="commitments-page">
                <p>Loading commitments...</p>
            </section>
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

        return (
            matchesSearch &&
            matchesGroup &&
            matchesStatus &&
            matchesPriority
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

            {loadError && (
                <div
                    className="commitments-page__message commitments-page__message--error"
                    role="alert"
                >
                    {loadError}
                </div>
            )}

            {!loadError && commitments.length === 0 && (
                <div className="commitments-page__empty">
                    <h2>No commitments yet</h2>

                    <p>
                        Add your first commitment to start tracking bills,
                        contracts and important deadlines.
                    </p>

                    <Link to="/commitments/new">
                        Add commitment
                    </Link>
                </div>
            )}

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
                        onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                        <option value="">All priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>

                <button
                    type="button"
                    className="commitments-toolbar__clear"
                    onClick={() => {
                        setSearchQuery("");
                        setGroupFilter("");
                        setStatusFilter("");
                        setPriorityFilter("");
                    }}
                >
                    Clear filters
                </button>
            </div>

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
                                    <th>Next due</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Payment status</th>
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
                                            {formatDate(commitment.due_date)}
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
                                            {commitment.payment_status
                                                ?.replaceAll("_", " ") || "—"}
                                        </td>

                                        <td>
                                            <div className="commitments-table__actions">
                                                <Link to={`/commitments/${commitment.id}`}>
                                                    View
                                                </Link>

                                                <Link to={`/commitments/${commitment.id}/edit`}>
                                                    Edit
                                                </Link>

                                                <button type="button" disabled>
                                                    Archive
                                                </button>
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
                                        <dt>Next due</dt>
                                        <dd>{formatDate(commitment.due_date)}</dd>
                                    </div>

                                    <div>
                                        <dt>Status</dt>
                                        <dd>{commitment.status?.name || "—"}</dd>
                                    </div>

                                    <div>
                                        <dt>Payment</dt>
                                        <dd>
                                            {commitment.payment_status
                                                ?.replaceAll("_", " ") || "—"}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="commitments-mobile-card__actions">
                                    <Link to={`/commitments/${commitment.id}`}>
                                        View
                                    </Link>

                                    <Link to={`/commitments/${commitment.id}/edit`}>
                                        Edit
                                    </Link>

                                    <button type="button" disabled>
                                        Archive
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default CommitmentsPage;