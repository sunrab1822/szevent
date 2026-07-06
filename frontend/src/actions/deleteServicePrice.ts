import { getServicePrices } from "./getServicePrices";

export const deleteServicePrice = async (id: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/delete-other-price`, {
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

    await getServicePrices();

    return true;
};
