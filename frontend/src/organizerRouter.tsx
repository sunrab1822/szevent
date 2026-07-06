import { Navigate } from "react-router";
import DefaultLayout from "./layouts/DefaultLayout";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import DatasheetPage from "./pages/DatasheetPage";
import { datasheetPageLoader } from "./loaders/datasheetPageLoader";
import { eventsPageLoader } from "./loaders/eventsPageLoader";
import UniPriceAssignPage from "./pages/UniPriceAssignPage";
import { uniPriceAssignLoader } from "./loaders/uniPriceAssignLoader";
import OfferReviewPage from "./pages/OfferReviewPage";
import { offerReviewPageLoader } from "./loaders/offerReviewPageLoader";
import SettingsPage from "./pages/SettingsPage";

export const organizerRouter = [
    {
        element: <DefaultLayout />,
        path: "/",
        id: "organizer",
        children: [
            {
                element: <DashboardPage />,
                index: true,
                path: "/",
            },
            {
                element: <EventsPage />,
                id: "events",
                path: "events",
                loader: eventsPageLoader,
            },
            {
                element: <DatasheetPage />,
                id: "datasheet",
                path: "datasheet/:id",
                loader: datasheetPageLoader,
            },
            {
                element: <SettingsPage />,
                id: "settings",
                path: "settings",
            },
            {
                element: <UniPriceAssignPage />,
                path: "/assign-uni-price/:id",
                loader: uniPriceAssignLoader,
            },
            {
                element: <OfferReviewPage />,
                path: "/offers/:eventId/:offerType/:versionId",
                loader: offerReviewPageLoader,
            },
            {
                element: <Navigate to="/" replace />,
                path: "*",
            },
        ],
    },
];
