import type { User } from "../../entitys/user";

export interface SessionState {
    user: User | null | false;
    token: string | null;
}
