import { createAction } from "@reduxjs/toolkit";
import type { Message } from "../../../entitys/message";

interface Payload {
    message: Message;
}
export const AddOptimisticMessage = createAction<Payload>("CHAT__ADD_OPTIMISTIC_MESSAGE");
