import { createReducer } from "@reduxjs/toolkit";
import { Authenticate } from "../action/session/authenticate";
import { Login } from "../action/session/login";
import { Logout } from "../action/session/logout";
import type { SessionState } from "../state/sessionState";

const initialState: SessionState = {
    user: false,
    token: null,
};

export const sessionReducer = createReducer(initialState, (builder) => {
    builder.addCase(Authenticate, (state, action) => {
        state.user = action.payload.user;
    });

    builder.addCase(Login, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(`${import.meta.env.VITE_AUTH_TOKEN}`, action.payload.token || "");
    });

    builder.addCase(Logout, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem(`${import.meta.env.VITE_AUTH_TOKEN}`);
    });
});
