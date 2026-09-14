import { createAction } from "@reduxjs/toolkit";
import type { ChatChannel } from "../../../entitys/chat";
import type { Message } from "../../../entitys/message";

interface Payload {
    channel: ChatChannel;
    eventId: number;
    message: Message;
}
export const AddOptimisticMessage = createAction<Payload>("CHAT__ADD_OPTIMISTIC_MESSAGE");
