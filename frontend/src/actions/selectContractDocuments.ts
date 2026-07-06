export const selectContractDocuments = async (eventId: number, documentIds: number[]): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/legal/contract-data`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: eventId,
            docIds: documentIds,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
