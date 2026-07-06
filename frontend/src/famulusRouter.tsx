import { Navigate } from "react-router";
import FamulusLayout from "./layouts/FamulusLayout";
import FamulusEventsPage from "./pages/famulus/FamulusEventsPage";
import { famulusPriceAssignLoader } from "./loaders/famulusPriceAssignLoader";
import { famulusEventsPageLoader } from "./loaders/famulusEventsPageLoader";
import { datasheetPageLoader } from "./loaders/datasheetPageLoader";
import FamulusDatasheetPage from "./pages/famulus/FamulusDatasheetPage";
import FamulusPriceAssignPage from "./pages/famulus/FamulusPriceAssignPage";
import OfferReviewPage from "./pages/OfferReviewPage";
import { offerReviewPageLoader } from "./loaders/offerReviewPageLoader";
import SettingsPage from "./pages/SettingsPage";

export const famulusRouter = [
    {
        element: <FamulusLayout />,
        path: "/",
        id: "public",
        children: [
            {
                element: <div />,
                index: true,
                path: "/",
            },
            {
                element: <FamulusEventsPage />,
                index: true,
                path: "/events",
                loader: famulusEventsPageLoader,
            },
            {
                element: <FamulusPriceAssignPage />,
                path: "/assign-price/:id",
                loader: famulusPriceAssignLoader,
            },
            {
                element: <FamulusDatasheetPage />,
                path: "/datasheet/:id",
                loader: datasheetPageLoader,
            },
            {
                element: <OfferReviewPage />,
                path: "/offers/:eventId/:offerType/:versionId",
                loader: offerReviewPageLoader,
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
