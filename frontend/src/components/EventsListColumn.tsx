import type { Event } from "../entitys/event";
import { Link } from "react-router-dom";

interface EventsListColumnProps {
    name: string;
    color: string;
    events: Event[];
}

const EventsListColumn = ({ name, color, events }: EventsListColumnProps) => {
    return (
        <div className="flex w-full flex-col gap-4 self-start">
            <div className="bg-white-bg sticky top-0 flex flex-row items-center justify-between py-2">
                <div className="flex flex-row items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <h2 className="font-semibold tracking-wide text-[#3e484c] uppercase max-[1220px]:text-[12px] max-[1000px]:text-[14px]">
                        {name}
                    </h2>
                </div>
                <div className="flex items-center justify-center rounded-sm bg-[#ebeef0] px-2 py-1 text-sm font-semibold text-[#3e484c]">
                    {events ? events.length : 0}
                </div>
            </div>
            {events?.map((event) => (
                <Link
                    key={event.id}
                    to={`/datasheet/${event.id}`}
                    className="border-primary-light relative flex w-full flex-col gap-4 rounded-lg bg-white p-4 transition-all hover:border-l-4"
                >
                    {event.unSeen && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500" />}
                    <h3 className="w-[90%] truncate font-bold" dangerouslySetInnerHTML={{ __html: event.name }} />
                    <p className="font-light break-words" dangerouslySetInnerHTML={{ __html: event.status }} />
                    {event.assigned_user && event.assigned_user.length > 0 && (
                        <div className="flex flex-row items-center gap-2 text-sm">
                            <img
                                src={event.assigned_user[0]?.picture}
                                alt={event.assigned_user[0]?.name}
                                className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                            />

                            <p dangerouslySetInnerHTML={{ __html: event.assigned_user[0]?.name }} />
                        </div>
                    )}
                </Link>
            ))}
        </div>
    );
};

export default EventsListColumn;
