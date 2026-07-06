import { createReducer } from "@reduxjs/toolkit";
import { SetEvents } from "../action/events/setEvents";
import type { EventsState } from "../state/eventsState";
import { SetSelectedEvent } from "../action/events/setSelectedEvent";
import { EditSelectedEvent } from "../action/events/editSelectedEvent";

const initialState: EventsState = {
    submittedEvents: [],
    offerEvents: [],
    inProgressEvents: [],
    settlementEvents: [],
    selectedEvent: null,
};

export const eventsReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetEvents, (state, action) => {
        if (action.payload.type === "submitted") {
            state.submittedEvents = action.payload.events;
        } else if (action.payload.type === "offer") {
            state.offerEvents = action.payload.events;
        } else if (action.payload.type === "inProgress") {
            state.inProgressEvents = action.payload.events;
        } else if (action.payload.type === "settlement") {
            state.settlementEvents = action.payload.events;
        }
    });

    builder.addCase(SetSelectedEvent, (state, action) => {
        state.selectedEvent = action.payload.selectedEvent;
    });

    builder.addCase(EditSelectedEvent, (state, action) => {
        if (state.selectedEvent) {
            const { field, value } = action.payload;
            state.selectedEvent[field] = value as never;
        }
    });
});
