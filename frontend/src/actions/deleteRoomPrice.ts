import { getRoomPrices } from "./getRoomPrices";

export const deleteRoomPrice = async (id: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/delete-uni-price`, {
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

    await getRoomPrices();

    return true;
};
