export const getFamulusOffers = async (id: number): Promise<any> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/get-famulus-offers`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();

    return body.offers;
};
