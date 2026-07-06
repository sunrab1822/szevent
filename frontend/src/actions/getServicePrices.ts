import { SetServicePrices } from "../redux/action/adminPrices/SetServicePrices";
import { store } from "../redux/store";

export const getServicePrices = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/other-prices`, {
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
    store.dispatch(SetServicePrices({ servicePrices: body.data }));

    return body;
};
