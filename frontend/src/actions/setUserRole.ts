import { getAllUsers } from "./getAllUsers";

export const setUserRole = async (userId: number, role: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/set-role`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: userId,
            role: role,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    await getAllUsers();

    return true;
};
