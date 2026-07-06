import { SetMessages } from "../redux/action/chat/setMessages";
import { store } from "../redux/store";

export const getMessages = async (eventId: number): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/chat`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventId,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    store.dispatch(SetMessages({ messages: body }));

    return body;
};
