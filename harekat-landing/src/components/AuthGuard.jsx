import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { token } from "../services/api.js";
import { getDashboardUrl } from "../utils/dashboardUrl.js";

export function AuthGuard({ children, requiredAuth = true }) {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        setIsAuthenticated(!!token());
        setChecking(false);
    }, []);

    useEffect(() => {
        const onStorage = () => {
            setIsAuthenticated(!!token());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    if (checking) {
        return null;
    }

    if (requiredAuth && !isAuthenticated) {
        window.location.href = getDashboardUrl('/login?redirect=' + encodeURIComponent(window.location.href));
        return null;
    }

    if (!requiredAuth && isAuthenticated) {
        window.location.href = getDashboardUrl('/overview');
        return null;
    }

    return children;
}