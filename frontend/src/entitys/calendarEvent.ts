export interface CalendarEvent {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    location?: string | null;
    unSeen?: boolean;
}
