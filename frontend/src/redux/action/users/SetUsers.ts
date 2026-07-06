import { createAction } from "@reduxjs/toolkit";
import type { User } from "../../../entitys/user";

interface Payload {
    users: User[];
}

export const SetUsers = createAction<Payload>("USERS__SET_USERS");
