export type OfferType = "famulus" | "uni" | "dorm";

export interface OfferLine {
    id: number;
    events_id: number;
    offer_name: string;
    duration: number;
    price_per_unit: number;
    total_price: number;
    night: number;
    created_at: string;
    updated_at: string;
    current: number;
    versions_id: number;
}

export interface OfferVersion {
    id: number;
    version: number;
    reason: string | null;
    offer_type: OfferType;
    created_at?: string;
    updated_at?: string;
    current?: boolean;
    offers: OfferLine[];
}
