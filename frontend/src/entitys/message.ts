import type { User } from "./user";

export interface Message {
    id: number;
    sender: User;
    users_id: number;
    events_id: number;
    message: string;
    created_at: number;
}
