const resolveApiUrl = (url: string) => (url.startsWith("http") ? url : `${import.meta.env.VITE_API_ORIGIN}${url}`);

export const downloadFileFromUrl = async (url: string, name: string): Promise<boolean> => {
    const response = await fetch(resolveApiUrl(url), {
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
