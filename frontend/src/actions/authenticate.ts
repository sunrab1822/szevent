import { Authenticate } from "../redux/action/session/authenticate";
import { store } from "../redux/store";

export const authenticate = async (): Promise<boolean> => {
    // const user = {
    //     id: 1,
    //     name: "Szuri Gergő",
    //     email: "V7WtM@example.com",
    //     role: 0,
    //     roleName: "Admin",
    //     role_with_domain: "Admin",
    //     displayName: "Szuri Gergő",
    //     admin: true,
    //     token: "token",
    //     picture: "https://placehold.co/40",
    // };
    // store.dispatch(Authenticate({ user: user }));
    // return true;
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
        return false;
    }
};
