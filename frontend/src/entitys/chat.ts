export const CHAT_CHANNELS = {
    ORGANIZER: "rendezvenyes",
    FAMULUS: "unifamulus",
    LEGAL: "jogi",
} as const;

export type ChatChannel = (typeof CHAT_CHANNELS)[keyof typeof CHAT_CHANNELS];

export interface ChatChannelOption {
    key: ChatChannel;
    label: string;
    description: string;
}
