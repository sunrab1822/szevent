export const statusChange = async (route: string, id: number, reason?: string): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/${route}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                ...(reason !== undefined ? { reason } : {}),
            }),
            method: "POST",
        });

        if (!response.ok) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};
