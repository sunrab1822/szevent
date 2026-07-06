import { createReducer } from "@reduxjs/toolkit";
import type { OfferState } from "../state/offerState";
import { SetOfferVersions } from "../action/offer/setOfferVersions";
import { SetSelectedOfferVersion } from "../action/offer/setSelectedOfferVersion";

const initialState: OfferState = {
    eventId: null,
    offerType: null,
    versions: [],
    selectedVersion: null,
};

export const offerReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetOfferVersions, (state, action) => {
        state.eventId = action.payload.eventId;
        state.offerType = action.payload.offerType;
        state.versions = action.payload.versions;
    });

    builder.addCase(SetSelectedOfferVersion, (state, action) => {
        state.selectedVersion = action.payload.selectedVersion;
    });
});
