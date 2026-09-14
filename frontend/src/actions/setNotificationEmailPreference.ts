import { authenticate } from "./authenticate";

export const setNotificationEmailPreference = async (notificationEmailEnabled: boolean): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/settings/notifications/email`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                notification_email_enabled: notificationEmailEnabled,
            }),
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
