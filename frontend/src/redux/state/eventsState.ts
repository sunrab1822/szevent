import type { Event } from "../../entitys/event";

export interface EventsState {
    submittedEvents: Event[] | [];
    offerEvents: Event[] | [];
    inProgressEvents: Event[] | [];
    settlementEvents: Event[] | [];
    selectedEvent: Event | null;
}
