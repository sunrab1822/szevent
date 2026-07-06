import { getAllUsers } from "./getAllUsers";

export const addUser = async (user: string): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/create-user`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: user,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    await getAllUsers();

    return true;
};
