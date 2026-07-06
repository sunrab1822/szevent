import { getEvents } from "../actions/getEvents";

export const eventsPageLoader = async () => {
    await getEvents();
    return null;
};
