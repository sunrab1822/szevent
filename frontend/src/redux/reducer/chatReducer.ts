import { createReducer } from "@reduxjs/toolkit";
import type { ChatState } from "../state/chatState";
import { SetMessages } from "../action/chat/setMessages";
import { AddOptimisticMessage } from "../action/chat/addOptimisticMessage";
import { SetSending } from "../action/chat/setSending";

const initialState: ChatState = {
    messagesByChannel: {},
    sendingByChannel: {},
};

export const chatReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetMessages, (state, action) => {
        state.messagesByChannel[action.payload.channel] = {
            eventId: action.payload.eventId,
            messages: action.payload.messages ?? [],
        };
    });
    builder.addCase(AddOptimisticMessage, (state, action) => {
        const currentMessages = state.messagesByChannel[action.payload.channel];

        if (!currentMessages || currentMessages.eventId !== action.payload.eventId) {
            state.messagesByChannel[action.payload.channel] = {
                eventId: action.payload.eventId,
                messages: [],
            };
        }

        state.messagesByChannel[action.payload.channel]?.messages.push(action.payload.message);
    });
    builder.addCase(SetSending, (state, action) => {
        state.sendingByChannel[action.payload.channel] = action.payload.sending;
    });
});
