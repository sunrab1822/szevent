import { getServicePrices } from "./getServicePrices";

export const saveServicePrice = async (data: any, isNew: boolean): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/${isNew ? "create" : "update"}-other-price`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    await getServicePrices();

    return true;
};
