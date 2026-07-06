import { createAction } from "@reduxjs/toolkit";
import type { Event } from "../../../entitys/event";

interface Payload {
    selectedEvent: Event;
}

export const SetSelectedEvent = createAction<Payload>(`EVENTS__SET_SELECTED_EVENT`);
