import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getMessages } from "../actions/getMessages";
import { SetMessages } from "../redux/action/chat/setMessages";
import type { ChatChannel } from "../entitys/chat";

const POLL_INTERVAL = 5000;

export function useChatPolling(eventId: number, channel: ChatChannel) {
    const dispatch = useDispatch();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchMessages = useCallback(async () => {
        if (document.hidden) return;
        try {
            getMessages(eventId, channel);
        } catch {
            // Silently fail, the next poll will retry.
        }
    }, [eventId, channel]);

    useEffect(() => {
        fetchMessages();
        intervalRef.current = setInterval(fetchMessages, POLL_INTERVAL);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            dispatch(SetMessages({ channel, eventId, messages: [] }));
        };
    }, [fetchMessages, dispatch, channel, eventId]);
}
