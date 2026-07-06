export const sendMessage = async (eventId: number, message: string): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/send`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventId,
            message,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
