import { useState } from "react";
import { Link } from "react-router";

/* Provides the default values shared by create and edit forms. */
const EMPTY_FORM_DATA = {
    title: "",
    group_id: "",
    provider_name: "",
    amount: "",
    payment_frequency: "",
    payment_status: "not_applicable",
    contract_end_date: "",
    notice_period_days: "",
    due_date: "",
    renewal_date: "",
    priority: "",
    status_id: "",
    notes: "",
};

function CommitmentForm({
    initialData = EMPTY_FORM_DATA,
    groups,
    statuses,
    accountPlan,
    onSubmit,
    onCancel,
    submitLabel,
    submittingLabel,
    loadError = "",
}) {
    const [formData, setFormData] = useState(() => ({
        ...EMPTY_FORM_DATA,
        ...initialData,
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [commitmentType, setCommitmentType] = useState("personal");

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({
            ...current,
            [name]: undefined,
        }));
    }

    /* Mirrors the backend deadline calculation for immediate form feedback. */
    function getCancellationDeadline() {
        if (
            !formData.contract_end_date ||
            formData.notice_period_days === ""
        ) {
            return "";
        }

        const deadline = new Date(
            `${formData.contract_end_date}T00:00:00Z`,
        );

        deadline.setUTCDate(
            deadline.getUTCDate() - Number(formData.notice_period_days),
        );

        return deadline.toISOString().split("T")[0];
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        /* Empty optional fields are sent as null instead of empty strings. */
        const payload = {
            ...formData,
            group_id: formData.group_id || null,
            status_id: formData.status_id || null,
            amount: formData.amount || null,
            contract_end_date: formData.contract_end_date || null,
            notice_period_days: formData.notice_period_days || null,
            due_date: formData.due_date || null,
            renewal_date: formData.renewal_date || null,
        };

        try {
            await onSubmit(payload);
        } catch (error) {
            setErrors(error || {});
        } finally {
            setIsSubmitting(false);
        }
    }

    const cancellationDeadline = getCancellationDeadline();
    const selectedGroup = groups.find(
        (group) => String(group.id) === String(formData.group_id),
    );

    return (
        <form
            className="commitment-form"
            onSubmit={handleSubmit}
        >
            <fieldset className="commitment-form__section">
                <legend>Basic details</legend>

                <div className="commitment-form__grid">
                    <div className="commitment-form__field">
                        <label htmlFor="title">
                            Title
                            <span aria-hidden="true"> *</span>
                        </label>

                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Council Tax"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />

                        {errors.title && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.title.join(" ")}
                            </p>
                        )}
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="group_id">
                            Commitment group
                            <span aria-hidden="true"> *</span>
                        </label>

                        <select
                            id="group_id"
                            name="group_id"
                            value={formData.group_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select commitment group
                            </option>

                            {groups.map((group) => (
                                <option
                                    key={group.id}
                                    value={group.id}
                                >
                                    {group.name}
                                </option>
                            ))}
                        </select>

                        {errors.group_id && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.group_id.join(" ")}
                            </p>
                        )}
                    </div>

                    {selectedGroup && (
                        <div className="commitment-form__group-guidance">
                            <p className="commitment-form__group-description">
                                {selectedGroup.description
                                    ?.split(/\n\s*\n/)
                                    .filter(Boolean)[0]}
                            </p>

                            <Link
                                className="commitment-form__group-guide-link"
                                to={`/guides?group=${selectedGroup.id}`}
                            >
                                View full guide
                            </Link>
                        </div>
                    )}

                    {accountPlan === "premium" && (
                        <div className="commitment-form__field commitment-form__field--premium-preview">
                            <div className="commitment-form__premium-heading">
                                <label htmlFor="commitment_type">
                                    Commitment type
                                </label>

                                <span className="commitment-form__premium-badge">
                                    Premium preview
                                </span>
                            </div>

                            <select
                                id="commitment_type"
                                value={commitmentType}
                                onChange={(event) => setCommitmentType(event.target.value)}
                            >
                                <option value="personal">
                                    Personal
                                </option>

                                <option value="family">
                                    Family
                                </option>
                            </select>

                            <p className="commitment-form__hint">
                                Preview how commitments could be organised as personal
                                or shared household items.
                            </p>

                            {commitmentType === "family" && (
                                <p className="commitment-form__premium-note">
                                    Multi-user sharing is not enabled in this prototype.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="commitment-form__field">
                        <label htmlFor="provider_name">
                            Provider name
                        </label>

                        <input
                            id="provider_name"
                            name="provider_name"
                            type="text"
                            placeholder="e.g. Your council or service provider"
                            value={formData.provider_name}
                            onChange={handleChange}
                        />

                        {errors.provider_name && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.provider_name.join(" ")}
                            </p>
                        )}
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="priority">
                            Priority
                            <span aria-hidden="true"> *</span>
                        </label>

                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select priority
                            </option>

                            <option value="low">
                                Low
                            </option>

                            <option value="medium">
                                Medium
                            </option>

                            <option value="high">
                                High
                            </option>
                        </select>

                        {errors.priority && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.priority.join(" ")}
                            </p>
                        )}
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="status_id">
                            Status
                            <span aria-hidden="true"> *</span>
                        </label>

                        <select
                            id="status_id"
                            name="status_id"
                            value={formData.status_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>
                                Select status
                            </option>

                            {statuses.map((status) => (
                                <option
                                    key={status.id}
                                    value={status.id}
                                >
                                    {status.name}
                                </option>
                            ))}
                        </select>

                        {errors.status_id && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.status_id.join(" ")}
                            </p>
                        )}
                    </div>
                </div>
            </fieldset>

            <fieldset className="commitment-form__section">
                <legend>Payment</legend>

                <div className="commitment-form__grid">
                    <div className="commitment-form__field">
                        <label htmlFor="amount">
                            Amount
                        </label>

                        <div className="commitment-form__amount">
                            <span aria-hidden="true">£</span>

                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </div>

                        {errors.amount && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.amount.join(" ")}
                            </p>
                        )}
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="payment_frequency">
                            Payment frequency
                        </label>

                        <select
                            id="payment_frequency"
                            name="payment_frequency"
                            value={formData.payment_frequency}
                            onChange={handleChange}
                        >
                            <option value="" disabled>
                                Select frequency
                            </option>

                            <option value="weekly">
                                Weekly
                            </option>

                            <option value="monthly">
                                Monthly
                            </option>

                            <option value="quarterly">
                                Quarterly
                            </option>

                            <option value="annually">
                                Annually
                            </option>

                            <option value="one_off">
                                One-off
                            </option>
                        </select>
                        <p className="commitment-form__hint">
                            Recurring payments automatically move to the next due date when marked Paid.
                        </p>
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="payment_status">
                            Payment status
                        </label>

                        <select
                            id="payment_status"
                            name="payment_status"
                            value={formData.payment_status}
                            onChange={handleChange}
                        >
                            <option value="not_applicable">
                                Not applicable
                            </option>

                            <option value="pending">
                                Pending
                            </option>

                            <option value="paid">
                                Paid
                            </option>

                            <option value="overdue">
                                Overdue
                            </option>
                        </select>
                        <p className="commitment-form__hint">
                            This status applies to the current payment cycle. Marking a recurring
                            payment as Paid records it in payment history and moves the commitment
                            to its next due date.
                        </p>
                    </div>
                </div>
            </fieldset>

            <fieldset className="commitment-form__section">
                <legend>Dates & deadlines</legend>

                <div className="commitment-form__grid">
                    <div className="commitment-form__field">
                        <label htmlFor="due_date">
                            Next due date
                        </label>

                        <input
                            id="due_date"
                            name="due_date"
                            type="date"
                            value={formData.due_date}
                            onChange={handleChange}
                        />

                        <p className="commitment-form__hint">
                            Next date when payment or action is required. For recurring payments,
                            this moves forward automatically after the current cycle is marked Paid.
                        </p>
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="contract_end_date">
                            Contract end date
                        </label>

                        <input
                            id="contract_end_date"
                            name="contract_end_date"
                            type="date"
                            value={formData.contract_end_date}
                            onChange={handleChange}
                        />

                        <p className="commitment-form__hint">
                            Use this for contracts or fixed-term agreements.
                        </p>
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="renewal_date">
                            Renewal date
                        </label>

                        <input
                            id="renewal_date"
                            name="renewal_date"
                            type="date"
                            value={formData.renewal_date}
                            onChange={handleChange}
                        />

                        <p className="commitment-form__hint">
                            Use this when the commitment renews on a specific date.
                        </p>
                    </div>

                    <div className="commitment-form__field">
                        <label htmlFor="notice_period_days">
                            Notice period
                        </label>

                        <div className="commitment-form__notice-period">
                            <input
                                id="notice_period_days"
                                name="notice_period_days"
                                type="number"
                                min="0"
                                placeholder="e.g. 30"
                                value={formData.notice_period_days}
                                onChange={handleChange}
                            />

                            <span>days</span>
                        </div>

                        <p className="commitment-form__hint">
                            Number of days before the contract end date when
                            cancellation is required.
                        </p>

                        {errors.notice_period_days && (
                            <p
                                className="commitment-form__error"
                                role="alert"
                            >
                                {errors.notice_period_days.join(" ")}
                            </p>
                        )}
                    </div>

                    {cancellationDeadline && (
                        <div className="commitment-form__field">
                            <label htmlFor="cancellation_deadline">
                                Cancellation deadline
                            </label>

                            <input
                                id="cancellation_deadline"
                                type="date"
                                value={cancellationDeadline}
                                readOnly
                            />

                            <p className="commitment-form__hint">
                                Calculated automatically from the contract end
                                date and notice period.
                            </p>
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="commitment-form__section">
                <legend>Notes</legend>

                <div className="commitment-form__field commitment-form__field--full">
                    <label htmlFor="notes">
                        Additional information
                    </label>

                    <textarea
                        id="notes"
                        name="notes"
                        placeholder="Add any notes here..."
                        value={formData.notes}
                        onChange={handleChange}
                        rows="5"
                    />

                    {errors.notes && (
                        <p
                            className="commitment-form__error"
                            role="alert"
                        >
                            {errors.notes.join(" ")}
                        </p>
                    )}
                </div>
            </fieldset>

            {errors.non_field_errors && (
                <div
                    className="add-commitment-page__message add-commitment-page__message--error"
                    role="alert"
                >
                    {errors.non_field_errors.join(" ")}
                </div>
            )}

            <div className="commitment-form__actions">
                <button
                    type="button"
                    className="commitment-form__cancel"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="commitment-form__submit"
                    disabled={isSubmitting || Boolean(loadError)}
                >
                    {isSubmitting
                        ? submittingLabel
                        : submitLabel}
                </button>
            </div>
        </form>
    );
}

export default CommitmentForm;