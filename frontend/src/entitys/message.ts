import type { User } from "./user";
import type { ChatChannel } from "./chat";

export interface MessageMention {
    userId: number;
    displayName: string;
    start: number;
    end: number;
}

export interface Message {
    id: number;
    sender: User;
    users_id: number;
    events_id: number;
    channel?: ChatChannel;
    message: string;
    mentions?: MessageMention[];
    created_at: number;
}
