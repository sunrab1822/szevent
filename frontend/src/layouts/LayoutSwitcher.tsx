import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useSelector } from "../redux/store";
import { publicRouter } from "../publicRouter";
import { defaultRouter } from "../defaultRouter";
import { useEffect, useRef, useState } from "react";
import { authenticate } from "../actions/authenticate";
import { ROLES } from "../entitys/roles";
import { getCookie } from "../utils/getCookie";
import { famulusRouter } from "../famulusRouter";
import { legalRouter } from "../legalRouter";
import { organizerRouter } from "../organizerRouter";
import { logout } from "../actions/logout";

const LayoutSwitcher = () => {
    const { user } = useSelector((state) => state.session);
    const [isInitializing, setIsInitializing] = useState(true);
    const routerRef = useRef<ReturnType<typeof createBrowserRouter> | null>(null);

    useEffect(() => {
        const runAuthenticate = async () => {
            try {
                await authenticate();
            } catch (error) {
                console.error("Authentication check failed:", error);
            } finally {
                setIsInitializing(false);
            }
        };
        getCookie("auth_token");
        runAuthenticate();
    }, []);

    if (isInitializing) return <div>Loading...</div>;

    if (!routerRef.current) {
        if (!user) {
            routerRef.current = createBrowserRouter(publicRouter);
        } else if (user.role === ROLES.ADMIN) {
            routerRef.current = createBrowserRouter(defaultRouter);
        } else if (user.role === ROLES.ORGANIZER) {
            routerRef.current = createBrowserRouter(organizerRouter);
        } else if (user.role === ROLES.FAMULUS) {
            routerRef.current = createBrowserRouter(famulusRouter);
        } else if (user.role === ROLES.LEGAL) {
            routerRef.current = createBrowserRouter(legalRouter);
        } else {
            logout();
            routerRef.current = createBrowserRouter(publicRouter);
        }
    }

    return <RouterProvider router={routerRef.current} />;
};

export default LayoutSwitcher;
