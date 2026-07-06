import { SetEvents } from "../redux/action/events/setEvents";
import { store } from "../redux/store";

export const getEvents = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/events`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetEvents({ type: "submitted", events: body.submitted }));
    store.dispatch(SetEvents({ type: "offer", events: body.offer }));
    store.dispatch(SetEvents({ type: "inProgress", events: body.inProgress }));
    store.dispatch(SetEvents({ type: "settlement", events: body.settlement }));

    return true;
};
