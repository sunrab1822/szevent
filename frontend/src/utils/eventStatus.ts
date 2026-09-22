const LOCKED_EVENT_STATUSES = ["Elutasítva", "Lemondva", "Rendezvény lezárva"];

export const isLockedEventStatus = (status: string) => LOCKED_EVENT_STATUSES.includes(status);
