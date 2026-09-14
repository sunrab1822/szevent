import { SetMessages } from "../redux/action/chat/setMessages";
import { store } from "../redux/store";
import type { ChatChannel } from "../entitys/chat";
import type { Message } from "../entitys/message";

export const getMessages = async (eventId: number, channel: ChatChannel): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/chat`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventId,
            channel,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    const body: Message[] = await response.json();
    const channelMessages = body.filter((message) => !message.channel || message.channel === channel);
    store.dispatch(SetMessages({ channel, eventId, messages: channelMessages }));

    return true;
};
