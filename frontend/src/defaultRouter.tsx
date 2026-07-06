import { Navigate } from "react-router";
import DefaultLayout from "./layouts/DefaultLayout";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import DatasheetPage from "./pages/DatasheetPage";
import { datasheetPageLoader } from "./loaders/datasheetPageLoader";
import { famulusAdminPricesLoader } from "./loaders/famulusAdminPricesLoader";
import FamulusAdminPricesPage from "./pages/FamulusAdminPricesPage";
import RoomAdminPricesPage from "./pages/RoomAdminPricesPage";
import { roomAdminPricesLoader } from "./loaders/roomAdminPricesLoader";
import { eventsPageLoader } from "./loaders/eventsPageLoader";
import UsersPage from "./pages/UsersPage";
import { usersPageLoader } from "./loaders/usersPageLoader";
import DocumentsPage from "./pages/DocumentsPage";
import { documentsPageLoader } from "./loaders/documentsPageLoader";
import ServicesAdminPricePage from "./pages/ServicesAdminPricesPage";
import { serviceAdminPricesLoader } from "./loaders/serviceAdminPricesLoader";
import UniPriceAssignPage from "./pages/UniPriceAssignPage";
import { uniPriceAssignLoader } from "./loaders/uniPriceAssignLoader";
import OfferReviewPage from "./pages/OfferReviewPage";
import { offerReviewPageLoader } from "./loaders/offerReviewPageLoader";
import SettingsPage from "./pages/SettingsPage";

export const defaultRouter = [
    {
        element: <DefaultLayout />,
        path: "/",
        id: "default",
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
                element: <FamulusAdminPricesPage />,
                id: "famulusPrices",
                path: "famulus-prices",
                loader: famulusAdminPricesLoader,
            },
            {
                element: <RoomAdminPricesPage />,
                id: "roomPrices",
                path: "room-prices",
                loader: roomAdminPricesLoader,
            },
            {
                element: <ServicesAdminPricePage />,
                id: "servicePrices",
                path: "service-prices",
                loader: serviceAdminPricesLoader,
            },
            {
                element: <UsersPage />,
                id: "users",
                path: "users",
                loader: usersPageLoader,
            },
            {
                element: <DocumentsPage />,
                id: "documents",
                path: "documents",
                loader: documentsPageLoader,
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
