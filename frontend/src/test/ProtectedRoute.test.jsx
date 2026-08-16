import { render, screen } from "@testing-library/react";
import {
    MemoryRouter,
    Route,
    Routes,
    useLocation,
} from "react-router";
import { afterEach, describe, expect, it } from "vitest";

import ProtectedRoute from "../components/ProtectedRoute";

function LoginPageProbe() {
    const location = useLocation();

    return (
        <>
            <p>Login page</p>
            <p>{location.state?.from}</p>
        </>
    );
}

describe("ProtectedRoute", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("redirects an unauthenticated user to login", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <p>Protected dashboard</p>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<LoginPageProbe />}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByText("Login page")
        ).toBeInTheDocument();

        expect(
            screen.getByText("/dashboard")
        ).toBeInTheDocument();

        expect(
            screen.queryByText("Protected dashboard")
        ).not.toBeInTheDocument();
    });

    it("shows protected content when an auth token exists", () => {
        localStorage.setItem(
            "authToken",
            "test-token"
        );

        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <p>Protected dashboard</p>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(
            screen.getByText("Protected dashboard")
        ).toBeInTheDocument();
    });
});