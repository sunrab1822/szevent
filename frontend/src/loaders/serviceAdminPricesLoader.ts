import { getServicePrices } from "../actions/getServicePrices";

export const serviceAdminPricesLoader = async () => {
    await getServicePrices();
    return null;
};
