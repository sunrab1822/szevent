export const sendEventForm = async (form: FormData): Promise<Response> => {
    return fetch(`${import.meta.env.VITE_API_ORIGIN}/api/create-event`, {
        body: form,
        method: "POST",
    });
};
