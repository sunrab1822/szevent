export const addOrganizerToEvent = async (userId: number[], eventId: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/assign`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: eventId,
            users: userId,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
