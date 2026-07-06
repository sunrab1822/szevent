export const uniNewOffer = async (id: number, data: any): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/uni/new-offer`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id,
                offers: data,
            }),
            method: "POST",
        });

        if (!response.ok) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};
