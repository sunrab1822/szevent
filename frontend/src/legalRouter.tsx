import { Navigate } from "react-router";
import FamulusLayout from "./layouts/FamulusLayout";
import { datasheetPageLoader } from "./loaders/datasheetPageLoader";
import { famulusEventsPageLoader } from "./loaders/famulusEventsPageLoader";
import LegalDatasheetPage from "./pages/legal/LegalDatasheetPage";
import LegalEventsPage from "./pages/legal/LegalEventsPage";
import SettingsPage from "./pages/SettingsPage";

export const legalRouter = [
    {
        element: <FamulusLayout />,
        path: "/",
        id: "legal",
        children: [
            {
                element: <div />,
                index: true,
                path: "/",
            },
            {
                element: <LegalEventsPage />,
                index: true,
                path: "/events",
                loader: famulusEventsPageLoader,
            },
            {
                element: <LegalDatasheetPage />,
                path: "/datasheet/:id",
                loader: datasheetPageLoader,
            },
            {
                element: <SettingsPage />,
                id: "settings",
                path: "settings",
            },
            {
                element: <Navigate to="/" replace />,
                path: "*",
            },
        ],
    },
];
