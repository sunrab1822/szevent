const resolveApiUrl = (url: string) => (url.startsWith("http") ? url : `${import.meta.env.VITE_API_ORIGIN}${url}`);

export const openFileFromUrl = async (url: string): Promise<boolean> => {
    const previewWindow = window.open("", "_blank");

    const response = await fetch(resolveApiUrl(url), {
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
