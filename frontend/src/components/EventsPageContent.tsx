import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getEvents } from "../actions/getEvents";
import { useSelector } from "../redux/store";
import EventsListColumn from "./EventsListColumn";

interface EventsPageContentProps {
    datasheetPathPrefix?: string;
}

const EventsPageContent = ({ datasheetPathPrefix = "" }: EventsPageContentProps) => {
    const { submittedEvents, offerEvents, inProgressEvents, settlementEvents } = useSelector((state) => state.event);
    const [search, setSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const didMount = useRef(false);

    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }

        const abortController = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setIsSearching(true);

            try {
                await getEvents({ search, signal: abortController.signal });
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    console.error(error);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => {
            window.clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [search]);

    return (
        <div className="flex w-full flex-col gap-4">
            <div className="flex w-full justify-end">
                <div className="flex w-full flex-col items-start gap-2 min-[720px]:w-auto min-[720px]:items-end">
                    <div className="relative w-full min-[720px]:min-w-[350px]">
                        <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Keresés..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-[#3e484c]/10 bg-white py-2 pr-4 pl-9 text-sm text-[#3e484c] outline-none placeholder:text-[#bdc3c5] focus:ring-2 focus:ring-blue-400/40"
                        />
                    </div>
                    {isSearching && <span className="text-sm text-[#3e484c]/50">Keresés...</span>}
                </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <EventsListColumn name="Beérkezett" color="#50adc9" events={submittedEvents} datasheetPathPrefix={datasheetPathPrefix} />
                <EventsListColumn
                    name="Árajánlat készítés"
                    color="#8b500e"
                    events={offerEvents}
                    datasheetPathPrefix={datasheetPathPrefix}
                />
                <EventsListColumn name="Megvalósítás" color="#00677e" events={inProgressEvents} datasheetPathPrefix={datasheetPathPrefix} />
                <EventsListColumn name="Elszámolás" color="#bec8cd" events={settlementEvents} datasheetPathPrefix={datasheetPathPrefix} />
            </div>
        </div>
    );
};

export default EventsPageContent;
