import type { Event } from "../entitys/event";
import { formatDate } from "../utils/formatDate";
import { Tooltip } from "antd";
import { MessageSquareWarning } from "lucide-react";

interface StatusHistoryProps {
    selectedEvent: Event;
}

const StatusHistory = ({ selectedEvent }: StatusHistoryProps) => {
    return (
        <div className="flex max-h-[400px] flex-col gap-2 overflow-y-scroll">
            <h3 className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Állapot előzmények</h3>
            <div className="flex flex-col">
                {selectedEvent.status_changes.length > 0 ? (
                    [...selectedEvent.status_changes].reverse().map((status, idx, array) => (
                        <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="border-primary-light h-5 w-5 shrink-0 rounded-full border-2 bg-white" />

                                {idx !== array.length - 1 && <div className="my-1 w-0.5 grow bg-gray-300" />}
                            </div>

                            <div className="flex flex-col pb-5">
                                <p className="text-sm font-semibold text-gray-900">{status.to}</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    {status.user.displayName} • {formatDate(status.created_at)}
                                </p>
                            </div>
                            {status.reason && (
                                <div className="ml-auto">
                                    <Tooltip
                                        title={status.reason}
                                        styles={{
                                            container: { backgroundColor: "#000000" },
                                        }}
                                    >
                                        <MessageSquareWarning color="#50adc9" />
                                    </Tooltip>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center text-[14px]">Nincs előzmény!</div>
                )}
            </div>
        </div>
    );
};

export default StatusHistory;
