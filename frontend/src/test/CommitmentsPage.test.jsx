import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CommitmentsPage from "../pages/CommitmentsPage";

import {
    getCommitments,
    getCommitmentGroups,
    getCommitmentStatuses,
    getCurrentMonthPayments,
    getPaymentHistory,
} from "../services/commitmentService";


vi.mock("../services/commitmentService", () => ({
    archiveCommitment: vi.fn(),
    deleteCommitment: vi.fn(),
    getArchivedCommitments: vi.fn(),
    getCommitments: vi.fn(),
    getCommitmentGroups: vi.fn(),
    getCommitmentStatuses: vi.fn(),
    getCurrentMonthPayments: vi.fn(),
    getPaymentHistory: vi.fn(),
    restoreCommitment: vi.fn(),
}));


const commitments = [
    {
        id: 1,
        title: "Car Loan",
        provider_name: "Example Bank",
        amount: "540.00",
        due_date: "2026-09-07",
        priority: "high",
        payment_status: "pending",
        effective_payment_status: "pending",
        review_needed: false,
        group: {
            id: 1,
            name: "Vehicle & Transport",
        },
        status: {
            id: 1,
            name: "Active",
        },
    },
    {
        id: 2,
        title: "Electricity Bill",
        provider_name: "Scottish Power",
        amount: "95.00",
        due_date: "2026-08-25",
        priority: "medium",
        payment_status: "pending",
        effective_payment_status: "pending",
        review_needed: false,
        group: {
            id: 2,
            name: "Utilities & Communications",
        },
        status: {
            id: 1,
            name: "Active",
        },
    },
];


describe("CommitmentsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        getCommitments.mockResolvedValue(commitments);

        getCommitmentGroups.mockResolvedValue([
            {
                id: 1,
                name: "Vehicle & Transport",
            },
            {
                id: 2,
                name: "Utilities & Communications",
            },
        ]);

        getCommitmentStatuses.mockResolvedValue([
            {
                id: 1,
                name: "Active",
            },
        ]);

        getCurrentMonthPayments.mockResolvedValue([]);
        getPaymentHistory.mockResolvedValue([]);
    });


    it("filters commitments by title", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <CommitmentsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("Car Loan").length
            ).toBeGreaterThan(0);
        });

        expect(
            screen.getAllByText("Electricity Bill").length
        ).toBeGreaterThan(0);

        const searchInput = screen.getByLabelText("Search");

        await user.type(searchInput, "Car");

        expect(
            screen.getAllByText("Car Loan").length
        ).toBeGreaterThan(0);

        expect(
            screen.queryByText("Electricity Bill")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("Showing 1 commitment")
        ).toBeInTheDocument();
    });


    it("filters commitments by provider name", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <CommitmentsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("Car Loan").length
            ).toBeGreaterThan(0);
        });

        const searchInput = screen.getByLabelText("Search");

        await user.type(searchInput, "Scottish Power");

        expect(
            screen.getAllByText("Electricity Bill").length
        ).toBeGreaterThan(0);

        expect(
            screen.queryByText("Car Loan")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("Showing 1 commitment")
        ).toBeInTheDocument();
    });

    it("filters commitments by current-month payment cycle status", async () => {
        getCurrentMonthPayments.mockResolvedValue([
            {
                id: 101,
                commitment_id: 1,
                commitment_title: "Car Loan",
                due_date: "2026-08-07",
                amount: "540.00",
                status: "paid",
                effective_status: "paid",
                paid_at: "2026-08-07T10:00:00Z",
            },
            {
                id: 102,
                commitment_id: 2,
                commitment_title: "Electricity Bill",
                due_date: "2026-08-25",
                amount: "95.00",
                status: "pending",
                effective_status: "pending",
                paid_at: null,
            },
        ]);

        render(
            <MemoryRouter
                initialEntries={[
                    "/commitments?payment_cycle_status=paid",
                ]}
            >
                <CommitmentsPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getAllByText("Car Loan").length
            ).toBeGreaterThan(0);
        });

        expect(
            screen.queryByText("Electricity Bill")
        ).not.toBeInTheDocument();

        expect(
            screen.getByText("Showing 1 commitment")
        ).toBeInTheDocument();
    });
});