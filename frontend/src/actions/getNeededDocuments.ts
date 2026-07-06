import type { Document } from "../entitys/document";

export const getNeededDocuments = async (eventId: number): Promise<Document[] | false> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/needed/${eventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = (await response.json()) as Document[];
    return body;
};
