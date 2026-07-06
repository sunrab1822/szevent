import { createAction } from "@reduxjs/toolkit";
import type { Message } from "../../../entitys/message";

interface Payload {
    messages: Message[];
}

export const SetMessages = createAction<Payload>("CHAT__SET_MESSAGES");
