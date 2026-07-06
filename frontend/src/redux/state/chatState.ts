import type { Message } from "../../entitys/message";

export interface ChatState {
    messages: Message[];
    sending: boolean;
}
