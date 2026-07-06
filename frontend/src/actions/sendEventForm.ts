export const sendEventForm = async (form: FormData): Promise<Response> => {
    return fetch(`/api/create-event`, {
        body: form,
        method: "POST",
    });
};
