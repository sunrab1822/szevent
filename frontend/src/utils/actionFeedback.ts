import { notification } from "antd";

let isNotificationConfigured = false;

const ensureNotificationConfig = () => {
    if (isNotificationConfigured) return;

    notification.config({
        top: 100,
    });

    isNotificationConfigured = true;
};

export const showActionSuccess = (description: string, message = "Siker") => {
    ensureNotificationConfig();
    notification.success({
        message,
        description,
    });
};

export const showActionError = (description = "Valami hiba történt", message = "Hiba") => {
    ensureNotificationConfig();
    notification.error({
        message,
        description,
    });
};
