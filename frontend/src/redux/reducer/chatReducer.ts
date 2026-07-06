import { createReducer } from "@reduxjs/toolkit";
import type { ChatState } from "../state/chatState";
import { SetMessages } from "../action/chat/setMessages";
import { AddOptimisticMessage } from "../action/chat/addOptimisticMessage";
import { SetSending } from "../action/chat/setSending";

const initialState: ChatState = {
    messages: [],
    sending: false,
};

export const chatReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetMessages, (state, action) => {
        state.messages = action.payload.messages ?? [];
    });
    builder.addCase(AddOptimisticMessage, (state, action) => {
        state.messages ??= [];
        state.messages.push(action.payload.message);
    });
    builder.addCase(SetSending, (state, action) => {
        state.sending = action.payload;
    });
});
