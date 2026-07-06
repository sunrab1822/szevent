import { createAction } from "@reduxjs/toolkit";
import type { OfferType, OfferVersion } from "../../../entitys/Offer";

interface Payload {
    eventId: number;
    offerType: OfferType;
    versions: OfferVersion[];
}

export const SetOfferVersions = createAction<Payload>("OFFER__SET_VERSIONS");
