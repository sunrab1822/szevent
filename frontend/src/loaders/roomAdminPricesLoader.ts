import { getRoomPrices } from "../actions/getRoomPrices";

export const roomAdminPricesLoader = async () => {
    await getRoomPrices();
    return null;
};
