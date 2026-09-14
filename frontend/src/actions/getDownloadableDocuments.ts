import type { DownloadableDocument, DownloadableDocumentsResponse } from "../entitys/downloadableDocument";

export const getDownloadableDocuments = async (eventId: number): Promise<DownloadableDocument[] | false> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/downloadable-documents/${eventId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = (await response.json()) as DownloadableDocumentsResponse;

    return body.documents;
};
