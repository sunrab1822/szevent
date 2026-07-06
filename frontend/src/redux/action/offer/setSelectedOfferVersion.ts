import { createAction } from "@reduxjs/toolkit";
import type { OfferVersion } from "../../../entitys/Offer";

interface Payload {
    selectedVersion: OfferVersion | null;
}

export const SetSelectedOfferVersion = createAction<Payload>("OFFER__SET_SELECTED_VERSION");
