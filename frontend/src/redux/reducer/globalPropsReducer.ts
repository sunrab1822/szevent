import { createReducer } from "@reduxjs/toolkit";
import type { GlobalPropsState } from "../state/globalPropsState";
import { SetSidebarOpen } from "../action/globalProps/setSidebarOpen";

const initialState: GlobalPropsState = {
    sidebarOpen: true,
};

export const globalPropsReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetSidebarOpen, (state, action) => {
        state.sidebarOpen = action.payload;
    });
});
