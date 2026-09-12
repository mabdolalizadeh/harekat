import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function AuthGuard({ children, requiredAuth = true, redirectTo = "/auth" }) {
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setTimeout(() => {
            setIsAuthenticated(!!token);
            setChecking(false);
        }, 0);
    }, []);

    useEffect(() => {
        const onStorage = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    if (checking) {
        return null;
    }

    if (requiredAuth && !isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (!requiredAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}