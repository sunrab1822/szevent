import { createAction } from "@reduxjs/toolkit";
import type { ChatChannel } from "../../../entitys/chat";

interface Payload {
    channel: ChatChannel;
    sending: boolean;
}

export const SetSending = createAction<Payload>("CHAT__SET_SENDING");
