import { MessagesSquare, SendHorizontal } from "lucide-react";
import { Tooltip } from "antd";
import { formatTime } from "../utils/formatTime";
import type { Event } from "../entitys/event";
import { useDispatch } from "react-redux";
import { useSelector } from "../redux/store";
import { useEffect, useRef, useState } from "react";
import { useChatPolling } from "../utils/useChatPolling";
import type { Message } from "../entitys/message";
import { useSessionUser } from "../utils/useSessionUser";
import { AddOptimisticMessage } from "../redux/action/chat/addOptimisticMessage";
import { SetSending } from "../redux/action/chat/setSending";
import { sendMessage } from "../actions/sendMessage";

interface ChatHistoryProps {
    eventData: Event;
}

const ChatHistory = ({ eventData }: ChatHistoryProps) => {
    const user = useSessionUser();
    const dispatch = useDispatch();

    const { messages, sending } = useSelector((state) => state.chats);
    const [input, setInput] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    useChatPolling(eventData.id);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    };

    useEffect(() => {
        if (isAtBottomRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setInput("");

        const optimistic: Message = {
            id: Date.now(),
            sender: {
                id: user.id,
                name: user.name,
                role_with_domain: user.role_with_domain,
                displayName: user.displayName,
                role: user.role,
                roleName: user.roleName,
                admin: user.admin,
                token: user.token,
                email: user.email,
                picture: user.picture,
            },
            users_id: user.id,
            events_id: eventData.id,
            message: text,
            created_at: Date.now(),
        };
        dispatch(AddOptimisticMessage({ message: optimistic }));
        dispatch(SetSending(true));

        try {
            await sendMessage(eventData.id, text);
        } finally {
            dispatch(SetSending(false));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (
        <div className="flex w-full flex-col gap-4 rounded-md bg-white p-4">
            <div className="flex w-full flex-row items-center gap-2 border-b border-gray-100 pb-3">
                <MessagesSquare color="#50adc9" />
                <h3 className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Belső üzenetek</h3>
            </div>

            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex max-h-[300px] w-full grow flex-col overflow-y-auto pr-2">
                {messages ? (
                    messages.map((message, idx, array) => {
                        const isMe = message.users_id === user.id;
                        const nextMsg = array[idx + 1];

                        const timeDiff = nextMsg ? new Date(nextMsg.created_at).getTime() - new Date(message.created_at).getTime() : 0;

                        const isLastInGroup = !nextMsg || nextMsg.users_id !== message.users_id || timeDiff > 5 * 60 * 1000;
                        return (
                            <div key={message.id} className={`mb-1 flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                                {!isMe && isLastInGroup && (
                                    <img
                                        src={message.sender.picture}
                                        className="mr-2 mb-5 h-8 w-8 flex-shrink-0 self-end rounded-full object-cover"
                                        alt={message.sender.displayName}
                                    />
                                )}

                                <div
                                    className={`flex max-w-[75%] flex-col ${isMe ? "items-end" : isLastInGroup ? "items-start" : "ml-10 items-start"}`}
                                >
                                    <Tooltip
                                        title={`${message.sender.displayName} • ${formatTime(message.created_at)}`}
                                        placement={isMe ? "left" : "right"}
                                    >
                                        <div
                                            className={`px-4 py-2 text-sm ${
                                                isMe
                                                    ? "rounded-2xl rounded-br-sm bg-[#50adc9] text-white"
                                                    : "rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {message.message}
                                        </div>
                                    </Tooltip>

                                    {isLastInGroup && (
                                        <span className="mt-1 px-1 text-[11px] text-gray-400">
                                            {message.sender.displayName} • {formatTime(message.created_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div></div>
                )}
            </div>

            <div className="relative mt-2 flex w-full items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Írj egy üzenetet..."
                    className="w-full rounded-full border border-gray-300 bg-gray-50 py-3 pr-12 pl-4 text-sm focus:border-[#50adc9] focus:ring-1 focus:ring-[#50adc9] focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#50adc9] text-white transition-colors hover:bg-[#3e8ca5] disabled:opacity-50"
                    aria-label="Send message"
                >
                    <SendHorizontal size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatHistory;
