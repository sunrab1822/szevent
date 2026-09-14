export interface UserNotification {
    id: number;
    event_id: number;
    event_name: string;
    message: string;
    created_at: string;
    read_at?: string | null;
}
