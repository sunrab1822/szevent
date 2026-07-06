import { createReducer } from "@reduxjs/toolkit";
import type { UsersState } from "../state/usersState";
import { SetUsers } from "../action/users/SetUsers";

const initialState: UsersState = {
    users: [],
};

export const usersReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetUsers, (state, action) => {
        state.users = action.payload.users;
    });
});
