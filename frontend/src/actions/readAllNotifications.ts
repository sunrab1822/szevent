import { authenticate } from "./authenticate";

export const readAllNotifications = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/notifications/read-all`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            method: "POST",
        });

        if (!response.ok) {
            return false;
        }

        await authenticate();

        return true;
    } catch {
        return false;
    }
};
