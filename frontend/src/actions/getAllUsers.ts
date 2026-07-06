import { SetUsers } from "../redux/action/users/SetUsers";
import { store } from "../redux/store";

export const getAllUsers = async (): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/users`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetUsers({ users: body.users }));

    return true;
};
