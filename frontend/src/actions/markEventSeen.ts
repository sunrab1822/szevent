export const markEventSeen = async (eventId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/seen`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                eventId,
            }),
            method: "POST",
        });

        return response.ok;
    } catch {
        return false;
    }
};
