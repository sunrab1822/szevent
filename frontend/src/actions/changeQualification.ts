export const changeQualification = async (id: number, value: boolean): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/toggle-qualification`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
        body: JSON.stringify({
            id,
            qualification: value ? 1 : 0,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
