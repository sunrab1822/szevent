import { createAction } from "@reduxjs/toolkit";
import type { User } from "../../../entitys/user";

interface Payload {
    user: User | null | false;
    token: string | null;
}

export const Login = createAction<Payload>(`SESSION__LOGIN`);
