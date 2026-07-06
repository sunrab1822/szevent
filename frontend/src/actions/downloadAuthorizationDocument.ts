export const downloadAuthorizationDocument = async (id: number, name: string): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/engedelyezes/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
        },
    });

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.setAttribute("download", name);

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
};
