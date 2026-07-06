export interface FamulusOffers {
    id: number;
    events_id: number;
    offer_name: string;
    duration: number;
    price_per_unit: number;
    total_price: number;
    night: boolean;
    created_at: string;
    current: number;
}
