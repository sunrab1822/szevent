import { BarChart3, ChevronLeft, ChevronRight, MapPin, PieChart as PieChartIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getCalendarEvents } from "../actions/getCalendarEvents";
import { getStatistics } from "../actions/getStatistics";
import type { CalendarEvent } from "../entitys/calendarEvent";
import type { Statistics, StatisticsPeriod } from "../entitys/statistics";

interface CalendarDay {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
}

interface CalendarEventSegment {
    event: CalendarEvent;
    startColumn: number;
    startDateKey: string;
    endDateKey: string;
    span: number;
    row: number;
    startsBeforeWeek: boolean;
    endsAfterWeek: boolean;
}

interface CalendarWeek {
    days: CalendarDay[];
    segments: CalendarEventSegment[];
}

const WEEK_DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const STATISTICS_PERIOD_OPTIONS: { label: string; value: StatisticsPeriod }[] = [
    { label: "Hét", value: "week" },
    { label: "Hónap", value: "month" },
    { label: "Év", value: "year" },
];
const CHART_COLORS = ["#50adc9", "#e06f5f", "#79a86b", "#e3aa4f", "#7a6fd1", "#d96ba8", "#4f8fba", "#9a7f5b"];
const EVENT_DURATION_START_COLOR: [number, number, number] = [205, 245, 219];
const EVENT_DURATION_MIDDLE_COLOR: [number, number, number] = [190, 232, 230];
const EVENT_DURATION_END_COLOR: [number, number, number] = [186, 215, 247];
const MONTH_FORMATTER = new Intl.DateTimeFormat("hu-HU", { month: "long", year: "numeric" });
const DAY_FORMATTER = new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric" });

const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const addDays = (date: Date, days: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);

    return nextDate;
};

const getCalendarStart = (monthStart: Date) => addDays(monthStart, -((monthStart.getDay() + 6) % 7));

const getCalendarEnd = (monthEnd: Date) => addDays(monthEnd, 6 - ((monthEnd.getDay() + 6) % 7));

const isToday = (date: Date) => toDateKey(date) === toDateKey(new Date());

const getEventStartKey = (event: CalendarEvent) => event.startDate.slice(0, 10);

const getEventEndKey = (event: CalendarEvent) => event.endDate.slice(0, 10);

const isMultiDayEvent = (event: CalendarEvent) => getEventStartKey(event) !== getEventEndKey(event);

const isEventOnDay = (event: CalendarEvent, dayKey: string) => {
    const startKey = getEventStartKey(event);
    const endKey = getEventEndKey(event);

    if (endKey < startKey) {
        return startKey === dayKey;
    }

    return startKey <= dayKey && dayKey <= endKey;
};

const buildCalendarDays = (activeMonth: Date, events: CalendarEvent[]): CalendarDay[] => {
    const monthStart = getMonthStart(activeMonth);
    const monthEnd = getMonthEnd(activeMonth);
    const calendarStart = getCalendarStart(monthStart);
    const calendarEnd = getCalendarEnd(monthEnd);
    const days: CalendarDay[] = [];

    for (let day = calendarStart; day <= calendarEnd; day = addDays(day, 1)) {
        const date = new Date(day);
        const dateKey = toDateKey(date);

        days.push({
            date,
            dateKey,
            isCurrentMonth: date.getMonth() === activeMonth.getMonth(),
            events: events.filter((event) => isEventOnDay(event, dateKey)),
        });
    }

    return days;
};

const chunkCalendarWeeks = (calendarDays: CalendarDay[]) => {
    const weeks: CalendarDay[][] = [];

    for (let index = 0; index < calendarDays.length; index += 7) {
        weeks.push(calendarDays.slice(index, index + 7));
    }

    return weeks;
};

const getEventSortValue = (event: CalendarEvent) => `${getEventStartKey(event)}-${getEventEndKey(event)}-${event.name}`;

const getDayIndexFromKey = (dateKey: string) => {
    const [year = "0", month = "1", day = "1"] = dateKey.split("-");

    return Math.floor(Date.UTC(Number(year), Number(month) - 1, Number(day)) / 86_400_000);
};

const blendColor = (from: [number, number, number], to: [number, number, number], amount: number) =>
    from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount)) as [number, number, number];

const formatRgb = ([red, green, blue]: [number, number, number]) => `rgb(${red}, ${green}, ${blue})`;

const getDurationColor = (position: number) => {
    if (position <= 0.5) {
        return formatRgb(blendColor(EVENT_DURATION_START_COLOR, EVENT_DURATION_MIDDLE_COLOR, position * 2));
    }

    return formatRgb(blendColor(EVENT_DURATION_MIDDLE_COLOR, EVENT_DURATION_END_COLOR, (position - 0.5) * 2));
};

const findLastDayIndex = (days: CalendarDay[], predicate: (day: CalendarDay) => boolean) => {
    for (let index = days.length - 1; index >= 0; index -= 1) {
        const day = days[index];

        if (day && predicate(day)) {
            return index;
        }
    }

    return -1;
};

const buildWeekSegments = (weekDays: CalendarDay[], events: CalendarEvent[]): CalendarEventSegment[] => {
    const weekStartKey = weekDays[0]?.dateKey;
    const weekEndKey = weekDays[weekDays.length - 1]?.dateKey;

    if (!weekStartKey || !weekEndKey) {
        return [];
    }

    const rowEnds: number[] = [];

    return events
        .filter((event) => getEventStartKey(event) <= weekEndKey && getEventEndKey(event) >= weekStartKey)
        .sort((firstEvent, secondEvent) => getEventSortValue(firstEvent).localeCompare(getEventSortValue(secondEvent), "hu-HU"))
        .map((event) => {
            const eventStartKey = getEventStartKey(event);
            const eventEndKey = getEventEndKey(event);
            const startColumn = Math.max(
                0,
                weekDays.findIndex((day) => day.dateKey >= eventStartKey)
            );
            const endColumn = Math.max(
                startColumn,
                findLastDayIndex(weekDays, (day) => day.dateKey <= eventEndKey)
            );
            const row = rowEnds.findIndex((rowEnd) => rowEnd < startColumn);
            const segmentRow = row === -1 ? rowEnds.length : row;

            rowEnds[segmentRow] = endColumn;

            return {
                event,
                startColumn,
                startDateKey: weekDays[startColumn]?.dateKey ?? eventStartKey,
                endDateKey: weekDays[endColumn]?.dateKey ?? eventEndKey,
                span: endColumn - startColumn + 1,
                row: segmentRow,
                startsBeforeWeek: eventStartKey < weekStartKey,
                endsAfterWeek: eventEndKey > weekEndKey,
            };
        });
};

const buildCalendarWeeks = (calendarDays: CalendarDay[], events: CalendarEvent[]): CalendarWeek[] =>
    chunkCalendarWeeks(calendarDays).map((days) => ({
        days,
        segments: buildWeekSegments(days, events),
    }));

const getSegmentShapeClassName = (segment: CalendarEventSegment) => {
    if (segment.startsBeforeWeek && segment.endsAfterWeek) {
        return "border-x-0";
    }

    if (segment.startsBeforeWeek) {
        return "rounded-r-md border-l-0";
    }

    if (segment.endsAfterWeek) {
        return "rounded-l-md border-r-0";
    }

    return "rounded-md";
};

const getSegmentBackground = (segment: CalendarEventSegment) => {
    if (!isMultiDayEvent(segment.event)) {
        return undefined;
    }

    const eventStartIndex = getDayIndexFromKey(getEventStartKey(segment.event));
    const eventEndIndex = getDayIndexFromKey(getEventEndKey(segment.event));
    const segmentStartIndex = getDayIndexFromKey(segment.startDateKey);
    const segmentEndIndex = getDayIndexFromKey(segment.endDateKey);
    const eventSpan = Math.max(eventEndIndex - eventStartIndex, 1);
    const startPosition = (segmentStartIndex - eventStartIndex) / eventSpan;
    const endPosition = (segmentEndIndex - eventStartIndex) / eventSpan;
    const middlePosition = (startPosition + endPosition) / 2;

    return `linear-gradient(90deg, ${getDurationColor(startPosition)} 0%, ${getDurationColor(middlePosition)} 50%, ${getDurationColor(endPosition)} 100%)`;
};

const buildStatusChartData = (statistics: Statistics | null) => {
    if (!statistics) {
        return [];
    }

    return Object.entries(statistics.all.statuses)
        .map(([name, status]) => ({
            name,
            count: status.count,
        }))
        .filter((status) => status.count > 0)
        .sort((firstStatus, secondStatus) => secondStatus.count - firstStatus.count);
};

const formatTimelinePeriod = (period: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
        return DAY_FORMATTER.format(new Date(period));
    }

    if (/^\d{4}-\d{2}$/.test(period)) {
        return MONTH_FORMATTER.format(new Date(`${period}-01`));
    }

    return period;
};

const buildTimelineChartData = (statistics: Statistics | null) => {
    if (!statistics) {
        return [];
    }

    return statistics.received.timeline.map((timelineItem) => ({
        period: formatTimelinePeriod(timelineItem.period),
        total: timelineItem.total,
    }));
};

const DashboardPage = () => {
    const [activeMonth, setActiveMonth] = useState(getMonthStart(new Date()));
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [statisticsPeriod, setStatisticsPeriod] = useState<StatisticsPeriod>("month");
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [statisticsLoading, setStatisticsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [statisticsHasError, setStatisticsHasError] = useState(false);

    const monthStart = getMonthStart(activeMonth);
    const monthEnd = getMonthEnd(activeMonth);
    const calendarStartKey = toDateKey(getCalendarStart(monthStart));
    const calendarEndKey = toDateKey(getCalendarEnd(monthEnd));
    const calendarDays = useMemo(() => buildCalendarDays(activeMonth, events), [activeMonth, events]);
    const calendarWeeks = useMemo(() => buildCalendarWeeks(calendarDays, events), [calendarDays, events]);
    const statusChartData = useMemo(() => buildStatusChartData(statistics), [statistics]);
    const timelineChartData = useMemo(() => buildTimelineChartData(statistics), [statistics]);

    useEffect(() => {
        let ignoreResponse = false;

        const fetchEvents = async () => {
            setLoading(true);
            setHasError(false);

            const fetchedEvents = await getCalendarEvents(calendarStartKey, calendarEndKey);

            if (ignoreResponse) {
                return;
            }

            if (fetchedEvents === false) {
                setEvents([]);
                setHasError(true);
            } else {
                setEvents(fetchedEvents);
            }

            setLoading(false);
        };

        void fetchEvents();

        return () => {
            ignoreResponse = true;
        };
    }, [calendarStartKey, calendarEndKey]);

    useEffect(() => {
        let ignoreResponse = false;

        const fetchStatistics = async () => {
            setStatisticsLoading(true);
            setStatisticsHasError(false);

            const fetchedStatistics = await getStatistics(statisticsPeriod);

            if (ignoreResponse) {
                return;
            }

            if (fetchedStatistics === false) {
                setStatistics(null);
                setStatisticsHasError(true);
            } else {
                setStatistics(fetchedStatistics);
            }

            setStatisticsLoading(false);
        };

        void fetchStatistics();

        return () => {
            ignoreResponse = true;
        };
    }, [statisticsPeriod]);

    const handlePreviousMonth = () => {
        setActiveMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setActiveMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleCurrentMonth = () => {
        setActiveMonth(getMonthStart(new Date()));
    };

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold tracking-wide text-[#3e484c]/60 uppercase">Irányítópult</p>
                    <h1 className="text-xl font-bold text-[#3e484c] capitalize">{MONTH_FORMATTER.format(activeMonth)}</h1>
                </div>

                <div className="flex flex-row items-center gap-2">
                    <button
                        type="button"
                        onClick={handlePreviousMonth}
                        className="hover:text-primary-light flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f6] text-[#3e484c] transition-colors"
                        aria-label="Előző hónap"
                        title="Előző hónap"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={handleCurrentMonth}
                        className="hover:text-primary-light h-10 cursor-pointer rounded-lg bg-[#f1f4f6] px-4 text-sm font-semibold text-[#3e484c] transition-colors"
                    >
                        Mai hónap
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="hover:text-primary-light flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-[#f1f4f6] text-[#3e484c] transition-colors"
                        aria-label="Következő hónap"
                        title="Következő hónap"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {hasError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    A naptár eseményeit nem sikerült betölteni.
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                <div className="grid grid-cols-7 border-b border-[#dce3e6] bg-[#f1f4f6]">
                    {WEEK_DAYS.map((dayName) => (
                        <div key={dayName} className="px-2 py-3 text-center text-xs font-bold tracking-wide text-[#3e484c]/70 uppercase">
                            {dayName}
                        </div>
                    ))}
                </div>

                <div className="hidden sm:block">
                    {calendarWeeks.map((week) => {
                        const rowCount = Math.max(1, Math.max(...week.segments.map((segment) => segment.row + 1), 0));
                        const weekHeight = 52 + rowCount * 30;

                        return (
                            <div
                                key={week.days[0]?.dateKey}
                                className="relative border-b border-[#e7ecef]"
                                style={{ minHeight: weekHeight }}
                            >
                                <div className="grid grid-cols-7" style={{ minHeight: weekHeight }}>
                                    {week.days.map((day) => (
                                        <div
                                            key={day.dateKey}
                                            className={`min-h-full border-r border-[#e7ecef] p-2 ${
                                                day.isCurrentMonth ? "bg-white" : "bg-[#f7f9fa] text-[#3e484c]/45"
                                            }`}
                                        >
                                            <span
                                                className={`flex h-7 w-fit min-w-7 items-center justify-center rounded-lg px-2 text-sm font-bold ${
                                                    isToday(day.date) ? "bg-primary-light text-white" : "text-[#3e484c]"
                                                }`}
                                            >
                                                {day.date.getDate()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className="pointer-events-none absolute inset-x-0 top-10 grid grid-cols-7 gap-y-1 px-1"
                                    style={{ gridTemplateRows: `repeat(${rowCount}, 26px)` }}
                                >
                                    {week.segments.map((segment) => {
                                        const segmentBackground = getSegmentBackground(segment);

                                        return (
                                            <Link
                                                key={`${week.days[0]?.dateKey}-${segment.event.id}-${segment.startColumn}`}
                                                to={`/datasheet/${segment.event.id}`}
                                                className={`pointer-events-auto relative flex min-w-0 items-center gap-1.5 border px-2 text-left text-xs font-bold text-[#3e484c] transition hover:brightness-95 ${
                                                    segmentBackground
                                                        ? "border-white/70 shadow-sm"
                                                        : "border-primary-light/30 hover:border-primary-light bg-[#edf8fb] hover:bg-[#e2f3f7]"
                                                } ${getSegmentShapeClassName(segment)}`}
                                                style={{
                                                    gridColumn: `${segment.startColumn + 1} / span ${segment.span}`,
                                                    gridRow: segment.row + 1,
                                                    background: segmentBackground,
                                                }}
                                                title={segment.event.name}
                                            >
                                                {segment.startsBeforeWeek && (
                                                    <span className="flex-shrink-0 text-[#3e484c]/65">&lsaquo;</span>
                                                )}
                                                <span className="truncate">{segment.event.name}</span>
                                                {segment.endsAfterWeek && (
                                                    <span className="ml-auto flex-shrink-0 text-[#3e484c]/65">&rsaquo;</span>
                                                )}
                                                {segment.event.unSeen && (
                                                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 sm:hidden">
                    {calendarDays.map((day) => (
                        <div
                            key={day.dateKey}
                            className={`min-h-[108px] border-b border-[#e7ecef] p-2 ${
                                day.isCurrentMonth ? "bg-white" : "bg-[#f7f9fa] text-[#3e484c]/45"
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <span
                                    className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-sm font-bold ${
                                        isToday(day.date) ? "bg-primary-light text-white" : "text-[#3e484c]"
                                    }`}
                                >
                                    {day.date.getDate()}
                                </span>
                                <span className="text-xs font-medium text-[#3e484c]/45">{DAY_FORMATTER.format(day.date)}</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {day.events.map((event) => (
                                    <Link
                                        key={`${day.dateKey}-${event.id}`}
                                        to={`/datasheet/${event.id}`}
                                        className="border-primary-light/30 hover:border-primary-light relative flex min-h-9 flex-col gap-0.5 rounded-md border bg-[#edf8fb] px-2 py-1 text-left transition-colors hover:bg-[#e2f3f7]"
                                        title={event.name}
                                    >
                                        {event.unSeen && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />}
                                        <span className="line-clamp-1 pr-3 text-xs leading-snug font-bold text-[#3e484c]">
                                            {event.name}
                                        </span>
                                        <span className="truncate text-[11px] leading-none font-medium text-[#3e484c]/65">
                                            {event.status}
                                        </span>
                                        {event.location && (
                                            <span className="flex min-w-0 flex-row items-center gap-1 text-[11px] leading-none text-[#3e484c]/55">
                                                <MapPin size={11} className="flex-shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="border-t border-[#e7ecef] px-4 py-3 text-sm font-medium text-[#3e484c]/70">Naptár betöltése...</div>
                )}
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-wide text-[#3e484c]/60 uppercase">Statisztika</p>
                        <h2 className="text-lg font-bold text-[#3e484c]">Rendezvények áttekintése</h2>
                    </div>

                    <div className="flex w-full rounded-lg bg-[#f1f4f6] p-1 sm:w-auto">
                        {STATISTICS_PERIOD_OPTIONS.map((periodOption) => (
                            <button
                                key={periodOption.value}
                                type="button"
                                onClick={() => setStatisticsPeriod(periodOption.value)}
                                className={`h-9 flex-1 cursor-pointer rounded-md px-4 text-sm font-semibold transition-colors sm:flex-none ${
                                    statisticsPeriod === periodOption.value
                                        ? "bg-white text-[#3e484c] shadow-sm"
                                        : "text-[#3e484c]/65 hover:text-[#3e484c]"
                                }`}
                            >
                                {periodOption.label}
                            </button>
                        ))}
                    </div>
                </div>

                {statisticsHasError && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        A statisztikákat nem sikerült betölteni.
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-lg border border-[#e7ecef] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-bold text-[#3e484c]">Státuszmegoszlás</h3>
                                <p className="text-sm font-medium text-[#3e484c]/60">{statistics?.all.total ?? 0} rendezvény</p>
                            </div>
                            <PieChartIcon size={22} className="text-primary-light" />
                        </div>

                        <div className="h-[280px] [&_*:focus]:outline-none">
                            {statisticsLoading ? (
                                <div className="flex h-full items-center justify-center text-sm font-medium text-[#3e484c]/60">
                                    Statisztika betöltése...
                                </div>
                            ) : statusChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusChartData}
                                            dataKey="count"
                                            nameKey="name"
                                            innerRadius={58}
                                            outerRadius={92}
                                            paddingAngle={2}
                                            stroke="#ffffff"
                                            strokeWidth={2}
                                        >
                                            {statusChartData.map((status, index) => (
                                                <Cell key={status.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm font-medium text-[#3e484c]/60">
                                    Nincs megjeleníthető státuszadat.
                                </div>
                            )}
                        </div>

                        {statusChartData.length > 0 && (
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {statusChartData.slice(0, 8).map((status, index) => (
                                    <div key={status.name} className="flex min-w-0 items-center gap-2 text-sm text-[#3e484c]">
                                        <span
                                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                        />
                                        <span className="truncate font-medium">{status.name}</span>
                                        <span className="ml-auto font-bold">{status.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-[#e7ecef] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-bold text-[#3e484c]">Beérkezési trend</h3>
                                <p className="text-sm font-medium text-[#3e484c]/60">{statistics?.received.total ?? 0} rendezvény</p>
                            </div>
                            <BarChart3 size={22} className="text-primary-light" />
                        </div>

                        <div className="h-[280px] [&_*:focus]:outline-none">
                            {statisticsLoading ? (
                                <div className="flex h-full items-center justify-center text-sm font-medium text-[#3e484c]/60">
                                    Statisztika betöltése...
                                </div>
                            ) : timelineChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timelineChartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                                        <CartesianGrid stroke="#e7ecef" vertical={false} />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fill: "#3e484c", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fill: "#3e484c", fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip />
                                        <Bar dataKey="total" name="Beérkezett" fill="#50adc9" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm font-medium text-[#3e484c]/60">
                                    Nincs megjeleníthető idősoros adat.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
