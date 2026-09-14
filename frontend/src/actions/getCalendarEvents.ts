import type { CalendarEvent } from "../entitys/calendarEvent";

export const getCalendarEvents = async (startDate: string, endDate: string): Promise<CalendarEvent[] | false> => {
    const searchParams = new URLSearchParams({
        startDate,
        endDate,
    });

    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/calendar-events?${searchParams.toString()}`, {
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
    return body.events;
};
