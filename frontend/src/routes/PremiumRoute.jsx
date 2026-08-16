import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import { getAccount } from "../services/authService";

function PremiumRoute({ children }) {
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPlan() {
            try {
                const account = await getAccount();
                setPlan(account.plan);
            } finally {
                setIsLoading(false);
            }
        }

        loadPlan();
    }, []);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (plan !== "premium") {
        return <Navigate to="/settings" replace />;
    }

    return children;
}

export default PremiumRoute;