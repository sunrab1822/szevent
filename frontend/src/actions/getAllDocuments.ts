import { SetDocuments } from "../redux/action/documents/setDocuments";
import { store } from "../redux/store";

export const getAllDocuments = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/files`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetDocuments({ documents: body }));

    return true;
};
