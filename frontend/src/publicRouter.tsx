import { Navigate } from "react-router";
import FormPage from "./pages/FormPage";
import PublicLayout from "./layouts/PublicLayout";

export const publicRouter = [
    {
        element: <PublicLayout />,
        path: "/",
        id: "public",
        children: [
            {
                element: <FormPage />,
                index: true,
                path: "/",
            },
            {
                element: <Navigate to="/" replace />,
                path: "*",
            },
        ],
    },
];
