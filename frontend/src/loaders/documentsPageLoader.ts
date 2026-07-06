import { getAllDocuments } from "../actions/getAllDocuments";

export const documentsPageLoader = async () => {
    await getAllDocuments();
    return null;
};
