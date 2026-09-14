const resolveApiUrl = (url: string): string | null => {
    const apiOrigin = import.meta.env.VITE_API_ORIGIN || window.location.origin;
    const resolvedUrl = new URL(url, apiOrigin);
    const allowedOrigin = new URL(apiOrigin, window.location.origin).origin;

    return resolvedUrl.origin === allowedOrigin ? resolvedUrl.toString() : null;
};

export const downloadFileFromUrl = async (url: string, name: string): Promise<boolean> => {
    const resolvedUrl = resolveApiUrl(url);
    if (!resolvedUrl) {
        return false;
    }

    const response = await fetch(resolvedUrl, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
    });

    if (!response.ok) {
        return false;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.setAttribute("download", name);

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);

    return true;
};
