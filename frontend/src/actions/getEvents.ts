import { SetEvents } from "../redux/action/events/setEvents";
import { store } from "../redux/store";

interface GetEventsParams {
    search?: string;
    signal?: AbortSignal;
}

export const getEvents = async ({ search, signal }: GetEventsParams = {}): Promise<boolean> => {
    const searchParams = new URLSearchParams();
    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
        searchParams.set("search", trimmedSearch);
    }

    const queryString = searchParams.toString();
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/events${queryString ? `?${queryString}` : ""}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
        signal,
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
