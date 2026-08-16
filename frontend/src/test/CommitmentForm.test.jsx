import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import CommitmentForm from "../components/CommitmentForm";


const groups = [
    {
        id: 1,
        name: "Utilities & Communications",
        description: "Utility guidance",
        information_links: [],
    },
];

const statuses = [
    {
        id: 1,
        name: "Active",
    },
];


function renderForm() {
    return render(
        <MemoryRouter>
            <CommitmentForm
                groups={groups}
                statuses={statuses}
                accountPlan="free"
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
                submitLabel="Save commitment"
                submittingLabel="Saving..."
            />
        </MemoryRouter>
    );
}


describe("CommitmentForm", () => {
    it("calculates the cancellation deadline from contract end date and notice period", async () => {
        const user = userEvent.setup();

        renderForm();

        const contractEndDate = screen.getByLabelText(
            "Contract end date"
        );

        const noticePeriod = screen.getByLabelText(
            "Notice period"
        );

        await user.type(
            contractEndDate,
            "2026-10-31"
        );

        await user.type(
            noticePeriod,
            "30"
        );

        const cancellationDeadline = screen.getByLabelText(
            "Cancellation deadline"
        );

        expect(
            cancellationDeadline
        ).toHaveValue("2026-10-01");
    });

    it("shows recurring payment guidance when a recurring frequency is selected", async () => {
        const user = userEvent.setup();

        renderForm();

        const frequencySelect = screen.getByLabelText(
            "Payment frequency"
        );

        await user.selectOptions(
            frequencySelect,
            "monthly"
        );

        expect(
            screen.getByText(
                /recurring payments automatically move to the next due date/i
            )
        ).toBeInTheDocument();
    });
});