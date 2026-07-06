import { createAction } from "@reduxjs/toolkit";
import type { ServicePrices } from "../../../entitys/servicePrices";

type Payload = {
    servicePrices: ServicePrices[];
};

export const SetServicePrices = createAction<Payload>(`ADMIN_PRICES__SET_SERVICE_PRICES`);
