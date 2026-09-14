import type { Message } from "../../entitys/message";
import type { ChatChannel } from "../../entitys/chat";

interface ChatChannelMessages {
    eventId: number;
    messages: Message[];
}

export interface ChatState {
    messagesByChannel: Partial<Record<ChatChannel, ChatChannelMessages>>;
    sendingByChannel: Partial<Record<ChatChannel, boolean>>;
}
