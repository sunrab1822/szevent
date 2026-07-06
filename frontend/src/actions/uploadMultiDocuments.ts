export const uploadMultiDocuments = async (eventId: number, files: File[]): Promise<boolean> => {
    const formData = new FormData();
    formData.append("id", String(eventId));

    files.forEach((file) => {
        formData.append("files[]", file);
    });

    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/document/upload-multi`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
        body: formData,
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
