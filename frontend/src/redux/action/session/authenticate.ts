import { createAction } from "@reduxjs/toolkit";
import type { User } from "../../../entitys/user";

interface Payload {
    user: User | null;
}

export const Authenticate = createAction<Payload>(`SESSION__AUTHENTICATE`);
