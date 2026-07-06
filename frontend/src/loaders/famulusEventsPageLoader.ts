import { getAllUsers } from "../actions/getAllUsers";
import { getEvents } from "../actions/getEvents";

export const famulusEventsPageLoader = async () => {
    await getEvents();
    await getAllUsers();
    return null;
};
