import type { Event } from "../entitys/event";
import { SetArchivedEvents } from "../redux/action/events/setArchivedEvents";
import { store } from "../redux/store";

interface GetArchivedEventsParams {
    search?: string;
    signal?: AbortSignal;
}

const resolveArchivedEvents = (body: Event[] | { events?: Event[]; archived?: Event[]; archivedEvents?: Event[] }) => {
    if (Array.isArray(body)) {
        return body;
    }

    return body.events ?? body.archived ?? body.archivedEvents ?? [];
};

export const getArchivedEvents = async ({ search, signal }: GetArchivedEventsParams = {}): Promise<boolean> => {
    const searchParams = new URLSearchParams();
    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
        searchParams.set("search", trimmedSearch);
    }

    const queryString = searchParams.toString();
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/archived-events${queryString ? `?${queryString}` : ""}`, {
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
    store.dispatch(SetArchivedEvents({ events: resolveArchivedEvents(body) }));

    return true;
};
