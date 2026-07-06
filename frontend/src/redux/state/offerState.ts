import type { OfferType, OfferVersion } from "../../entitys/Offer";

export interface OfferState {
    eventId: number | null;
    offerType: OfferType | null;
    versions: OfferVersion[];
    selectedVersion: OfferVersion | null;
}
