import { createAction } from "@reduxjs/toolkit";
import type { Event } from "../../../entitys/event";

interface Payload {
    field: keyof Event;
    value: string | number | Date | boolean;
}

export const EditSelectedEvent = createAction<Payload>(`EVENTS__EDIT_SELECTED_EVENT`);
