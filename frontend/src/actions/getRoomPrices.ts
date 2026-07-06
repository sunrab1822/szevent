import { SetRoomPrices } from "../redux/action/adminPrices/SetRoomPrices";
import { store } from "../redux/store";

export const getRoomPrices = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/uni-prices`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetRoomPrices({ roomPrices: body.data }));

    return body;
};
