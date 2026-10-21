import { getArchivedEvents } from "../actions/getArchivedEvents";

export const archivedEventsPageLoader = async () => {
    await getArchivedEvents();
    return null;
};
