import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import CommitmentForm from "../components/CommitmentForm";

import {
    getCommitment,
    getCommitmentGroups,
    getCommitmentStatuses,
    updateCommitment,
} from "../services/commitmentService";

import "./AddCommitmentPage.css";

function EditCommitmentPage() {
    const navigate = useNavigate();
    const { commitmentId } = useParams();

    const [groups, setGroups] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        async function loadPageData() {
            try {
                const [
                    commitment,
                    groupData,
                    statusData,
                ] = await Promise.all([
                    getCommitment(commitmentId),
                    getCommitmentGroups(),
                    getCommitmentStatuses(),
                ]);

                setGroups(groupData);
                setStatuses(statusData);

                /* Converts API values into the string-based format expected by the form controls. */
                setInitialData({
                    title: commitment.title || "",
                    group_id: commitment.group?.id
                        ? String(commitment.group.id)
                        : "",
                    provider_name: commitment.provider_name || "",
                    amount: commitment.amount || "",
                    payment_frequency:
                        commitment.payment_frequency || "",
                    payment_status:
                        commitment.payment_status || "not_applicable",
                    contract_end_date:
                        commitment.contract_end_date || "",
                    notice_period_days:
                        commitment.notice_period_days ?? "",
                    due_date: commitment.due_date || "",
                    renewal_date: commitment.renewal_date || "",
                    priority: commitment.priority || "",
                    status_id: commitment.status?.id
                        ? String(commitment.status.id)
                        : "",
                    notes: commitment.notes || "",
                });
            } catch {
                setLoadError(
                    "Commitment could not be loaded. Please try again.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadPageData();
    }, [commitmentId]);

    async function handleUpdateCommitment(payload) {
        await updateCommitment(commitmentId, payload);
        navigate(`/commitments/${commitmentId}`);
    }

    if (isLoading) {
        return (
            <section className="add-commitment-page">
                <p className="add-commitment-page__loading">
                    Loading commitment...
                </p>
            </section>
        );
    }

    if (loadError || !initialData) {
        return (
            <section className="add-commitment-page">
                <div
                    className="add-commitment-page__message add-commitment-page__message--error"
                    role="alert"
                >
                    {loadError || "Commitment could not be loaded."}
                </div>
            </section>
        );
    }

    return (
        <section className="add-commitment-page">
            <header className="add-commitment-page__header">
                <div>
                    <p className="add-commitment-page__eyebrow">
                        Edit commitment
                    </p>

                    <h1>{initialData.title}</h1>

                    <p className="add-commitment-page__intro">
                        Update the commitment details you want Life Ledger
                        to track.
                    </p>
                </div>
            </header>

            <CommitmentForm
                initialData={initialData}
                groups={groups}
                statuses={statuses}
                onSubmit={handleUpdateCommitment}
                onCancel={() =>
                    navigate(`/commitments/${commitmentId}`)
                }
                submitLabel="Save changes"
                submittingLabel="Saving changes..."
            />
        </section>
    );
}

export default EditCommitmentPage;