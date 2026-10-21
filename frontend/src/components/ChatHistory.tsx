import { MessagesSquare, SendHorizontal } from "lucide-react";
import { Tooltip } from "antd";
import { formatTime } from "../utils/formatTime";
import type { Event } from "../entitys/event";
import { CHAT_CHANNELS, type ChatChannelOption } from "../entitys/chat";
import { ROLES } from "../entitys/roles";
import type { User } from "../entitys/user";
import { useDispatch } from "react-redux";
import { useSelector } from "../redux/store";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useChatPolling } from "../utils/useChatPolling";
import type { Message, MessageMention } from "../entitys/message";
import { useSessionUser } from "../utils/useSessionUser";
import { AddOptimisticMessage } from "../redux/action/chat/addOptimisticMessage";
import { SetSending } from "../redux/action/chat/setSending";
import { sendMessage } from "../actions/sendMessage";

type ChatMode = "organizer" | "famulus" | "legal";

interface ChatHistoryProps {
    eventData: Event;
    mode: ChatMode;
    readOnly?: boolean;
}

const CHAT_OPTIONS: Record<ChatMode, ChatChannelOption[]> = {
    organizer: [
        {
            key: CHAT_CHANNELS.ORGANIZER,
            label: "Szervezők",
            description: "Rendezvényszervezői belső",
        },
        {
            key: CHAT_CHANNELS.FAMULUS,
            label: "Famulus",
            description: "Famulus és szervezők",
        },
        {
            key: CHAT_CHANNELS.LEGAL,
            label: "Jogi osztály",
            description: "Jogi osztály és szervezők",
        },
    ],
    famulus: [
        {
            key: CHAT_CHANNELS.FAMULUS,
            label: "Famulus",
            description: "Famulus és szervezők",
        },
    ],
    legal: [
        {
            key: CHAT_CHANNELS.LEGAL,
            label: "Jogi osztály",
            description: "Jogi osztály és szervezők",
        },
    ],
};

const EMPTY_MESSAGES: Message[] = [];
const MAX_MENTION_SUGGESTIONS = 5;

interface MentionSearch {
    start: number;
    end: number;
    query: string;
}

interface SelectedMention {
    userId: number;
    displayName: string;
}

const normalizeMentionText = (value: string) =>
    value
        .trim()
        .toLocaleLowerCase("hu-HU")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getMentionSearch = (value: string, caretPosition: number): MentionSearch | null => {
    const beforeCaret = value.slice(0, caretPosition);
    const match = beforeCaret.match(/(^|\s)@([^\s@]*)$/);

    if (!match) {
        return null;
    }

    const query = match[2];
    const start = beforeCaret.length - query.length - 1;

    return {
        start,
        end: caretPosition,
        query,
    };
};

const buildMentionsPayload = (message: string, selectedMentions: SelectedMention[]): MessageMention[] => {
    const uniqueMentions = selectedMentions.filter(
        (mention, index, array) =>
            message.includes(`@${mention.displayName}`) &&
            array.findIndex((item) => item.userId === mention.userId && item.displayName === mention.displayName) === index
    );

    return uniqueMentions.flatMap((mention) => {
        const pattern = new RegExp(`@${escapeRegExp(mention.displayName)}(?=\\s|$|[.,!?;:])`, "g");
        const matches = [...message.matchAll(pattern)];

        return matches.map((match) => ({
            userId: mention.userId,
            displayName: mention.displayName,
            start: match.index ?? 0,
            end: (match.index ?? 0) + match[0].length,
        }));
    });
};

const renderMessageText = (message: Message) => {
    const mentions = [...(message.mentions ?? [])].sort((a, b) => a.start - b.start);

    if (mentions.length === 0) {
        return message.message;
    }

    const parts: ReactNode[] = [];
    let cursor = 0;

    mentions.forEach((mention) => {
        if (mention.start < cursor || mention.start >= message.message.length) return;

        if (mention.start > cursor) {
            parts.push(message.message.slice(cursor, mention.start));
        }

        parts.push(
            <span key={`${mention.userId}-${mention.start}`} className="font-semibold text-inherit underline underline-offset-2">
                {message.message.slice(mention.start, mention.end)}
            </span>
        );
        cursor = mention.end;
    });

    if (cursor < message.message.length) {
        parts.push(message.message.slice(cursor));
    }

    return parts;
};

const ChatHistory = ({ eventData, mode, readOnly = false }: ChatHistoryProps) => {
    const user = useSessionUser();
    const dispatch = useDispatch();

    const channels = CHAT_OPTIONS[mode];
    const defaultChannel = channels[0].key;
    const [activeChannel, setActiveChannel] = useState(defaultChannel);
    const activeChannelData = channels.find((channel) => channel.key === activeChannel) ?? channels[0];
    const { messagesByChannel, sendingByChannel } = useSelector((state) => state.chats);
    const { users } = useSelector((state) => state.users);
    const channelMessages = messagesByChannel[activeChannel];
    const messages = channelMessages?.eventId === eventData.id ? channelMessages.messages : EMPTY_MESSAGES;
    const sending = sendingByChannel[activeChannel] ?? false;
    const [input, setInput] = useState("");
    const [mentionSearch, setMentionSearch] = useState<MentionSearch | null>(null);
    const [activeMentionIndex, setActiveMentionIndex] = useState(0);
    const [selectedMentions, setSelectedMentions] = useState<SelectedMention[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    useChatPolling(eventData.id, activeChannel);

    const mentionableUsers = useMemo(() => {
        const allowedRolesByChannel: Record<string, User["role"][]> = {
            [CHAT_CHANNELS.ORGANIZER]: [ROLES.ADMIN, ROLES.ORGANIZER],
            [CHAT_CHANNELS.FAMULUS]: [ROLES.ADMIN, ROLES.ORGANIZER, ROLES.FAMULUS],
            [CHAT_CHANNELS.LEGAL]: [ROLES.ADMIN, ROLES.ORGANIZER, ROLES.LEGAL],
        };
        const allowedRoles = allowedRolesByChannel[activeChannel];
        const usersById = new Map<number, User>();
        const usersSource = users.length > 0 ? users : eventData.assigned_user;

        usersSource.forEach((assignedUser) => {
            if (assignedUser.id !== user.id && allowedRoles.includes(assignedUser.role)) {
                usersById.set(assignedUser.id, assignedUser);
            }
        });

        return [...usersById.values()].sort((firstUser, secondUser) =>
            firstUser.displayName.localeCompare(secondUser.displayName, "hu-HU")
        );
    }, [activeChannel, eventData.assigned_user, user.id, users]);

    const mentionSuggestions = useMemo(() => {
        if (!mentionSearch) return [];

        const query = normalizeMentionText(mentionSearch.query);

        return mentionableUsers
            .filter((mentionableUser) => {
                const displayName = normalizeMentionText(mentionableUser.displayName);
                const name = normalizeMentionText(mentionableUser.name);

                return displayName.includes(query) || name.includes(query);
            })
            .slice(0, MAX_MENTION_SUGGESTIONS);
    }, [mentionSearch, mentionableUsers]);
    const mentionPanelOpen = mentionSearch !== null;

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    };

    useEffect(() => {
        if (isAtBottomRef.current && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, activeChannel]);

    useEffect(() => {
        setActiveChannel(defaultChannel);
        setInput("");
        setMentionSearch(null);
        setSelectedMentions([]);
    }, [defaultChannel, eventData.id]);

    useEffect(() => {
        setActiveMentionIndex(0);
    }, [mentionSearch?.query, activeChannel]);

    const updateMentionSearch = (value: string, caretPosition: number | null) => {
        if (caretPosition === null) {
            setMentionSearch(null);
            return;
        }

        setMentionSearch(getMentionSearch(value, caretPosition));
    };

    const handleInputChange = (value: string, caretPosition: number | null) => {
        setInput(value);
        updateMentionSearch(value, caretPosition);
        setSelectedMentions((mentions) => mentions.filter((mention) => value.includes(`@${mention.displayName}`)));
    };

    const selectMention = (mentionableUser: User) => {
        if (!mentionSearch) return;

        const displayName = mentionableUser.displayName || mentionableUser.name;
        const mentionText = `@${displayName} `;
        const newInput = `${input.slice(0, mentionSearch.start)}${mentionText}${input.slice(mentionSearch.end)}`;
        const newCaretPosition = mentionSearch.start + mentionText.length;

        setInput(newInput);
        setMentionSearch(null);
        setSelectedMentions((mentions) => {
            if (mentions.some((mention) => mention.userId === mentionableUser.id && mention.displayName === displayName)) {
                return mentions;
            }

            return [...mentions, { userId: mentionableUser.id, displayName }];
        });

        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(newCaretPosition, newCaretPosition);
        });
    };

    const handleSend = async () => {
        if (readOnly) return;

        const text = input.trim();
        if (!text || sending) return;
        const mentions = buildMentionsPayload(text, selectedMentions);
        setInput("");
        setMentionSearch(null);
        setSelectedMentions([]);

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
            channel: activeChannel,
            message: text,
            mentions,
            created_at: Date.now(),
        };
        dispatch(AddOptimisticMessage({ channel: activeChannel, eventId: eventData.id, message: optimistic }));
        dispatch(SetSending({ channel: activeChannel, sending: true }));

        try {
            await sendMessage(eventData.id, text, activeChannel, mentions);
        } finally {
            dispatch(SetSending({ channel: activeChannel, sending: false }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (mentionSuggestions.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveMentionIndex((currentIndex) => (currentIndex + 1) % mentionSuggestions.length);
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveMentionIndex((currentIndex) => (currentIndex - 1 + mentionSuggestions.length) % mentionSuggestions.length);
                return;
            }

            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                selectMention(mentionSuggestions[activeMentionIndex]);
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                setMentionSearch(null);
                return;
            }
        }

        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (
        <div className="flex w-full flex-col gap-4 rounded-md bg-white p-4">
            <div className="flex w-full flex-col gap-3 border-b border-gray-100 pb-3">
                <div className="flex w-full flex-row items-center gap-2">
                    <MessagesSquare color="#50adc9" />
                    <div className="flex flex-col">
                        <h3 className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Üzenetek</h3>
                        <span className="text-xs text-gray-400">{activeChannelData.description}</span>
                    </div>
                </div>
                {channels.length > 1 && (
                    <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
                        {channels.map((channel) => {
                            const isActive = activeChannel === channel.key;

                            return (
                                <button
                                    key={channel.key}
                                    type="button"
                                    onClick={() => {
                                        setActiveChannel(channel.key);
                                        setInput("");
                                    }}
                                    className={`min-h-9 rounded-md px-2 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? "bg-white text-[#3e484c] shadow-sm"
                                            : "text-gray-500 hover:bg-white/70 hover:text-[#3e484c]"
                                    }`}
                                >
                                    {channel.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex max-h-[300px] w-full grow flex-col overflow-y-auto pr-2">
                {messages.length > 0 ? (
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
                                    className={`flex max-w-[75%] min-w-0 flex-col ${
                                        isMe ? "items-end" : isLastInGroup ? "items-start" : "ml-10 items-start"
                                    }`}
                                >
                                    <Tooltip
                                        title={`${message.sender.displayName} • ${formatTime(message.created_at)}`}
                                        placement={isMe ? "left" : "right"}
                                    >
                                        <div
                                            className={`break-all px-4 py-2 text-sm ${
                                                isMe
                                                    ? "rounded-2xl rounded-br-sm bg-[#50adc9] text-white"
                                                    : "rounded-2xl rounded-bl-sm bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {renderMessageText(message)}
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
                    <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-dashed border-gray-200 px-4 text-center text-sm text-gray-400">
                        Még nincs üzenet ebben a beszélgetésben.
                    </div>
                )}
            </div>

            {!readOnly && (
                <div className="relative mt-2 flex w-full items-center">
                {mentionPanelOpen && (
                    <div className="absolute right-0 bottom-12 left-0 z-10 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                        {mentionSuggestions.length > 0 ? (
                            mentionSuggestions.map((mentionableUser, index) => {
                                const isActive = index === activeMentionIndex;

                                return (
                                    <button
                                        key={mentionableUser.id}
                                        type="button"
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            selectMention(mentionableUser);
                                        }}
                                        className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors ${
                                            isActive ? "bg-[#50adc9]/10 text-[#3e484c]" : "hover:bg-gray-50"
                                        }`}
                                    >
                                        <img
                                            src={mentionableUser.picture}
                                            alt={mentionableUser.displayName}
                                            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                                        />
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold">{mentionableUser.displayName}</span>
                                            <span className="block truncate text-xs text-gray-400">{mentionableUser.roleName}</span>
                                        </span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-gray-400">Nincs tagelhető felhasználó.</div>
                        )}
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value, e.target.selectionStart)}
                    onClick={(e) => updateMentionSearch(e.currentTarget.value, e.currentTarget.selectionStart)}
                    onKeyUp={(e) => updateMentionSearch(e.currentTarget.value, e.currentTarget.selectionStart)}
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
            )}
        </div>
    );
};

export default ChatHistory;
