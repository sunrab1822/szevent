import { Archive, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getArchivedEvents } from "../actions/getArchivedEvents";
import { useSelector } from "../redux/store";

const formatEventDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

const ArchivedEventsPage = () => {
    const { archivedEvents } = useSelector((state) => state.event);
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
                await getArchivedEvents({ search, signal: abortController.signal });
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
            <div className="flex w-full flex-col items-start justify-between gap-4 min-[800px]:flex-row min-[800px]:items-center">
                <div className="text-[#3e484c]">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Archive size={24} />
                        Archív rendezvények
                    </h1>
                </div>

                <div className="flex w-full flex-col items-start gap-2 min-[800px]:w-auto min-[800px]:items-end">
                    <div className="relative w-full min-[800px]:min-w-[350px]">
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

            {archivedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-[#3e484c]/10 bg-white py-20 shadow-sm">
                    <Archive size={36} className="mb-3 text-[#3e484c]/20" />
                    <p className="text-sm text-[#3e484c]/50">Nincs találat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {archivedEvents.map((event) => (
                        <Link
                            key={event.id}
                            to={`/datasheet/${event.id}`}
                            className="border-primary-light relative flex min-h-[160px] w-full flex-col gap-3 rounded-lg bg-white p-4 transition-all hover:border-l-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="min-w-0 flex-1 truncate font-bold text-[#3e484c]">{event.name}</h2>
                                <span className="rounded-sm bg-[#ebeef0] px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#3e484c]">
                                    Archív
                                </span>
                            </div>
                            <p className="line-clamp-2 text-sm text-[#3e484c]/70">{event.status}</p>
                            <div className="mt-auto flex flex-col gap-1 text-sm text-[#3e484c]/60">
                                <span>{formatEventDate(event.startDate)}</span>
                                {event.assigned_user && event.assigned_user.length > 0 && <span>{event.assigned_user[0]?.name}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArchivedEventsPage;
