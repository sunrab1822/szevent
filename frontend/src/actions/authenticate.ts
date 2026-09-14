import { Authenticate } from "../redux/action/session/authenticate";
import { store } from "../redux/store";

export const authenticate = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/me`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
                "Content-Type": "application/json",
            },
            method: "GET",
            redirect: "manual",
        });

        if (!response.ok) {
            store.dispatch(Authenticate({ user: null }));
            return false;
        }

        const body = await response.json();
        store.dispatch(Authenticate({ user: body.user }));
        return true;
    } catch {
        store.dispatch(Authenticate({ user: null }));
        return false;
    }
};
