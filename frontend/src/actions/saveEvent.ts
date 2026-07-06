export const saveEvent = async (form: any): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/update-event`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
