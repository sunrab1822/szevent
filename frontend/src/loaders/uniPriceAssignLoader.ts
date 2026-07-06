import { getRoomPrices } from "../actions/getRoomPrices";
import { getServicePrices } from "../actions/getServicePrices";

export const uniPriceAssignLoader = async () => {
    await getRoomPrices();
    await getServicePrices();
    return null;
};
