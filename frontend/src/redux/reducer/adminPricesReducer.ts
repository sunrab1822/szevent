import { createReducer } from "@reduxjs/toolkit";
import type { AdminPricesState } from "../state/adminPricesState";
import { SetFamulusPrices } from "../action/adminPrices/SetFamulusPrices";
import { SetRoomPrices } from "../action/adminPrices/SetRoomPrices";
import { SetServicePrices } from "../action/adminPrices/SetServicePrices";

const initialState: AdminPricesState = {
    famulusPrices: [],
    roomPrices: [],
    servicePrices: [],
};

export const adminPricesReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetFamulusPrices, (state, action) => {
        state.famulusPrices = action.payload.famulusPrices;
    });
    builder.addCase(SetRoomPrices, (state, action) => {
        state.roomPrices = action.payload.roomPrices;
    });
    builder.addCase(SetServicePrices, (state, action) => {
        state.servicePrices = action.payload.servicePrices;
    });
});
