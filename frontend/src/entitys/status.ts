export interface Status {
    from: string;
    to: string;
    events_id: number;
    users_id: number;
    created_at: number;
    user: { displayName: string };
    reason: string | null;
}
