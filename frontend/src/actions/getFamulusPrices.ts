import { SetFamulusPrices } from "../redux/action/adminPrices/SetFamulusPrices";
import { store } from "../redux/store";

export const getFamulusPrices = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/famulus-prices`, {
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
    store.dispatch(SetFamulusPrices({ famulusPrices: body.data }));
    return true;
};
