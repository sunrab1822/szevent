import { createAction } from "@reduxjs/toolkit";
import type { FamulusPrice } from "../../../entitys/famulusPrice";

type Payload = {
    famulusPrices: FamulusPrice[];
};

export const SetFamulusPrices = createAction<Payload>(`ADMIN_PRICES__SET_FAMULUS_PRICES`);
