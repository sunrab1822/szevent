import { getAllUsers } from "./getAllUsers";

export const deleteUser = async (id: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/delete-user`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id,
        }),
        method: "DELETE",
    });

    if (!response.ok) {
        return false;
    }

    await getAllUsers();

    return true;
};
