const resolveApiUrl = (url: string): string | null => {
    const apiOrigin = import.meta.env.VITE_API_ORIGIN || window.location.origin;
    const resolvedUrl = new URL(url, apiOrigin);
    const allowedOrigin = new URL(apiOrigin, window.location.origin).origin;

    return resolvedUrl.origin === allowedOrigin ? resolvedUrl.toString() : null;
};

export const openFileFromUrl = async (url: string): Promise<boolean> => {
    const resolvedUrl = resolveApiUrl(url);
    if (!resolvedUrl) {
        return false;
    }

    const previewWindow = window.open("", "_blank");

    const response = await fetch(resolvedUrl, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
    });

    if (!response.ok) {
        previewWindow?.close();
        return false;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (previewWindow) {
        previewWindow.location.href = objectUrl;
    } else {
        window.open(objectUrl, "_blank");
    }

    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

    return true;
};
