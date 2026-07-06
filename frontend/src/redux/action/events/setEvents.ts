import { createAction } from "@reduxjs/toolkit";
import type { Event } from "../../../entitys/event";
import type { EventCategories } from "../../type/EventCategories";

interface Payload {
    type: EventCategories;
    events: Event[] | [];
}

export const SetEvents = createAction<Payload>(`EVENTS__SET_EVENTS`);
