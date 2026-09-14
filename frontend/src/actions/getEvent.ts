import { SetSelectedEvent } from "../redux/action/events/setSelectedEvent";
import { store } from "../redux/store";

export const getEvent = async (id: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/event`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetSelectedEvent({ selectedEvent: body.event[0] }));

    return true;
};
