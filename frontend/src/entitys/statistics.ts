import type { CalendarEvent } from "./calendarEvent";

export type StatisticsPeriod = "week" | "month" | "year";

export interface StatisticsStatusGroup {
    count: number;
    events: (CalendarEvent & { created_at?: string })[];
}

export interface StatisticsTimelineItem {
    period: string;
    start: string;
    total: number;
    statuses: Record<string, number>;
}

export interface StatisticsStatusCollection {
    total: number;
    statuses: Record<string, StatisticsStatusGroup>;
}

export interface StatisticsReceivedCollection extends StatisticsStatusCollection {
    days: number;
    timeline: StatisticsTimelineItem[];
}

export interface Statistics {
    period: StatisticsPeriod;
    all: StatisticsStatusCollection;
    received: StatisticsReceivedCollection;
}
