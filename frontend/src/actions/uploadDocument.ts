import { getAllDocuments } from "./getAllDocuments";

export const uploadDocument = async (file: File, type: number): Promise<boolean> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", String(type));
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/upload-file`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
        body: formData,
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    await getAllDocuments();

    return true;
};
