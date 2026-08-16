import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    MemoryRouter,
    Outlet,
    Route,
    Routes,
    useLocation,
} from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DashboardPage from "../pages/DashboardPage";

import {
    getCommitments,
    getCurrentMonthPayments,
    getHighPriorityCommitments,
    getOverdueCommitments,
    getReviewSoonCommitments,
    getUpcomingCommitments,
} from "../services/commitmentService";


vi.mock("../services/commitmentService", () => ({
    getCommitments: vi.fn(),
    getCurrentMonthPayments: vi.fn(),
    getHighPriorityCommitments: vi.fn(),
    getOverdueCommitments: vi.fn(),
    getReviewSoonCommitments: vi.fn(),
    getUpcomingCommitments: vi.fn(),
}));


vi.mock("../components/LoginSuccessTransition", () => ({
    default: () => null,
}));


function LocationProbe() {
    const location = useLocation();

    return (
        <p data-testid="location">
            {location.pathname}
            {location.search}
        </p>
    );
}

function DashboardTestLayout() {
    return (
        <Outlet
            context={{
                dashboardLogoRef: { current: null },
                accountPlan: "free",
            }}
        />
    );
}


describe("DashboardPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        sessionStorage.setItem(
            "dashboardIntroShown",
            "true"
        );

        getUpcomingCommitments.mockResolvedValue([]);
        getOverdueCommitments.mockResolvedValue([]);
        getHighPriorityCommitments.mockResolvedValue([]);
        getReviewSoonCommitments.mockResolvedValue([]);
        getCommitments.mockResolvedValue([]);

        getCurrentMonthPayments.mockResolvedValue([
            {
                id: 101,
                commitment_id: 1,
                commitment_title: "Car Loan",
                amount: "540.00",
                due_date: "2026-08-07",
                status: "paid",
                effective_status: "paid",
            },
            {
                id: 102,
                commitment_id: 2,
                commitment_title: "Electricity Bill",
                amount: "95.00",
                due_date: "2026-08-25",
                status: "pending",
                effective_status: "pending",
            },
        ]);
    });


    it("opens commitments filtered by the selected monthly payment status", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route element={<DashboardTestLayout />}>
                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />
                    </Route>

                    <Route
                        path="/commitments"
                        element={<LocationProbe />}
                    />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText("£540.00")
            ).toBeInTheDocument();
        });

        const paidSegment = screen.getByRole(
            "button",
            {
                name: "View paid commitments",
            }
        );

        await user.click(paidSegment);

        expect(
            screen.getByTestId("location")
        ).toHaveTextContent(
            "/commitments?payment_cycle_status=paid"
        );
    });
});