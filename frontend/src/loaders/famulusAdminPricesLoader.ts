import { getFamulusPrices } from "../actions/getFamulusPrices";

export const famulusAdminPricesLoader = async () => {
    await getFamulusPrices();
    return null;
};
