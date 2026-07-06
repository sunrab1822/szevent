import { createReducer } from "@reduxjs/toolkit";
import type { DocumentsState } from "../state/documentsState";
import { SetDocuments } from "../action/documents/setDocuments";

const initialState: DocumentsState = {
    documents: [],
};

export const documentsReducer = createReducer(initialState, (builder) => {
    builder.addCase(SetDocuments, (state, action) => {
        state.documents = action.payload.documents;
    });
});
