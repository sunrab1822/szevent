import { getFamulusPrices } from "./getFamulusPrices";

export const deleteFamulusPrice = async (id: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/delete-famulus-price`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    await getFamulusPrices();

    return true;
};
