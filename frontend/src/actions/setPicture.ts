import { authenticate } from "./authenticate";

export const setPicture = async (file: File): Promise<boolean> => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/setpicture`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            },
            body: formData,
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
