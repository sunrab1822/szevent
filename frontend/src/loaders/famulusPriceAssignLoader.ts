import { getFamulusPrices } from "../actions/getFamulusPrices";

export const famulusPriceAssignLoader = async () => {
    await getFamulusPrices();
    return null;
};
