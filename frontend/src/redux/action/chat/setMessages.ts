import { createAction } from "@reduxjs/toolkit";
import type { ChatChannel } from "../../../entitys/chat";
import type { Message } from "../../../entitys/message";

interface Payload {
    channel: ChatChannel;
    eventId: number;
    messages: Message[];
}

export const SetMessages = createAction<Payload>("CHAT__SET_MESSAGES");
