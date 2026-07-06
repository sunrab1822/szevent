import type { LoaderFunctionArgs } from "react-router-dom";
import { getAllDocuments } from "../actions/getAllDocuments";
import { getEvent } from "../actions/getEvent";
import { getAllUsers } from "../actions/getAllUsers";

export const datasheetPageLoader = async ({ params }: LoaderFunctionArgs) => {
    const eventId = Number(params.id);

    await getEvent(eventId);
    await getAllUsers();
    await getAllDocuments();
    return null;
};
