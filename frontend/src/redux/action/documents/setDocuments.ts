import { createAction } from "@reduxjs/toolkit";
import type { Document } from "../../../entitys/document";

interface Payload {
    documents: Document[];
}

export const SetDocuments = createAction<Payload>("DOCUMENTS__SET_DOCUMENTS");
