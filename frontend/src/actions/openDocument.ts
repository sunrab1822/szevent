export const openDocument = async (id: number): Promise<boolean> => {
    const previewWindow = window.open("", "_blank");

    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/download-file/${id}`, {
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
