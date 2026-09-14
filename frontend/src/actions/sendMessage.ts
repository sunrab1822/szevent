import type { ChatChannel } from "../entitys/chat";
import type { MessageMention } from "../entitys/message";

export const sendMessage = async (
    eventId: number,
    message: string,
    channel: ChatChannel,
    mentions: MessageMention[] = [],
): Promise<boolean> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/send`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            eventId,
            message,
            channel,
            mentions,
        }),
        method: "POST",
    });

    if (!response.ok) {
        return false;
    }

    return true;
};
