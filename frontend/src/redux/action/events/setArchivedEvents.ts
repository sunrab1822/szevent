import { createAction } from "@reduxjs/toolkit";
import type { Event } from "../../../entitys/event";

interface Payload {
    events: Event[] | [];
}

export const SetArchivedEvents = createAction<Payload>(`EVENTS__SET_ARCHIVED_EVENTS`);
