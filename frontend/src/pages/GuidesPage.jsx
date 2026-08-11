import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { getCommitmentGroups } from "../services/commitmentService";

import attentionIcon from "../assets/icons/guides/attention.svg";

import "./GuidesPage.css";

function GuidesPage() {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        async function loadGroups() {
            try {
                const data = await getCommitmentGroups();

                setGroups(data);

                if (data.length > 0) {
                    /* Uses the requested guide when valid, otherwise falls back to the first available group. */
                    const requestedGroupId = Number(searchParams.get("group"));

                    const requestedGroupExists = data.some(
                        (group) => group.id === requestedGroupId,
                    );

                    setSelectedGroupId(
                        requestedGroupExists ? requestedGroupId : data[0].id,
                    );
                }
            } catch {
                setError("Unable to load guidance.");
            } finally {
                setIsLoading(false);
            }
        }

        loadGroups();
    }, [searchParams]);

    const selectedGroup = groups.find(
        (group) => group.id === selectedGroupId,
    );

    if (isLoading) {
        return <p>Loading guidance...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <section className="guides-page">
            <header className="guides-page__header">
                <h1>UK guidance</h1>
                <p>
                    Practical information for managing common UK commitments.
                </p>
            </header>

            <div className="guides-page__layout">
                <aside className="guides-page__sidebar">
                    <h2 className="guides-page__sidebar-title">Guides</h2>

                    <select
                        className="guides-page__mobile-select"
                        value={selectedGroupId ?? ""}
                        onChange={(event) =>
                            setSelectedGroupId(Number(event.target.value))
                        }
                        aria-label="Select guidance group"
                    >
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>

                    <nav
                        className="guides-page__group-list"
                        aria-label="Guidance groups"
                    >
                        {groups.map((group) => (
                            <button
                                key={group.id}
                                type="button"
                                className={`guides-page__group-button ${selectedGroupId === group.id
                                    ? "guides-page__group-button--active"
                                    : ""
                                    }`}
                                onClick={() => setSelectedGroupId(group.id)}
                            >
                                {group.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                {selectedGroup && (
                    <article className="guides-page__content">
                        <div className="guides-page__content-header">
                            <h2>{selectedGroup.name}</h2>

                            <div className="guides-page__description">
                                {selectedGroup.description
                                    .split(/\n\s*\n/)
                                    .filter(Boolean)
                                    .map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                            </div>
                        </div>

                        {selectedGroup.information_links.length > 0 && (
                            <section className="guides-page__links">
                                <h3>Trusted external information</h3>

                                <div className="guides-page__link-list">
                                    {selectedGroup.information_links.map((link) => (
                                        <a
                                            key={link.id}
                                            className="guides-page__external-link"
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span>{link.title}</span>
                                            <span aria-hidden="true">↗</span>
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {selectedGroup.last_reviewed_at && (
                            <p className="guides-page__review-date">
                                Last reviewed:{" "}
                                {new Date(
                                    `${selectedGroup.last_reviewed_at}T00:00:00`,
                                ).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                        )}

                        <div className="guidance-warning">
                            <img
                                src={attentionIcon}
                                alt=""
                                className="guidance-warning__icon"
                            />

                            <div className="guidance-warning__content">
                                <strong>Warning:</strong>

                                <p>
                                    This is a practical summary only and not legal, financial, or official
                                    advice. Always check the official GOV.UK guidance for the most accurate
                                    information.
                                </p>
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </section>
    );
}

export default GuidesPage;