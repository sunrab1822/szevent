import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "../redux/store";
import type { RoomPrices } from "../entitys/roomPrices";
import type { ServicePrices } from "../entitys/servicePrices";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import { formatFt } from "../utils/formatFt";
import { uniNewOffer } from "../actions/uniNewOffer";
import ConfirmModal from "../components/ConfirmModal";

type RoomPriceMode = "daily" | "hourly";

interface SelectedRoomItem {
    kind: "room";
    id: number;
    name: string;
    accommodation: string;
    type: string;
    priceMode: RoomPriceMode;
    quantity: number;
    customPrice: number;
    customDiscount: number;
}

interface SelectedServiceItem {
    kind: "service";
    id: number;
    name: string;
    quantity: number;
    customPrice: number;
    customDiscount: number;
}

type SelectedCombinedItem = SelectedRoomItem | SelectedServiceItem;

const itemKey = (item: { kind: "room" | "service"; id: number }): string => `${item.kind}-${item.id}`;

const lineTotal = (item: SelectedCombinedItem): number => {
    const discountMultiplier = 1 - (item.customDiscount || 0) / 100;
    return item.customPrice * item.quantity * discountMultiplier;
};

const UniPriceAssignPage = () => {
    const [activeTab, setActiveTab] = useState<"room" | "service">("room");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<SelectedCombinedItem[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const roomPrices = useSelector((state) => state.adminPrices.roomPrices);
    const servicePrices = useSelector((state) => state.adminPrices.servicePrices);
    const { id } = useParams();
    const navigate = useNavigate();

    const selectedKeys = new Set(selected.map((s) => itemKey(s)));

    const filteredRooms = roomPrices.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    const filteredServices = servicePrices.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

    const addRoom = (room: RoomPrices): void => {
        const key = itemKey({ kind: "room", id: room.id });
        if (selectedKeys.has(key)) return;
        setSelected((prev) => [
            ...prev,
            {
                kind: "room",
                id: room.id,
                name: room.name,
                accommodation: room.accommodation,
                type: room.type,
                priceMode: "daily",
                quantity: 1,
                customPrice: room.dailyPrice,
                customDiscount: 0,
            },
        ]);
    };

    const addService = (service: ServicePrices): void => {
        const key = itemKey({ kind: "service", id: service.id });
        if (selectedKeys.has(key)) return;
        setSelected((prev) => [
            ...prev,
            {
                kind: "service",
                id: service.id,
                name: service.name,
                quantity: 1,
                customPrice: service.price,
                customDiscount: 0,
            },
        ]);
    };

    const removeItem = (key: string): void => {
        setSelected((prev) => prev.filter((s) => itemKey(s) !== key));
    };

    const updateItem = (key: string, patch: Partial<SelectedCombinedItem>): void => {
        setSelected((prev) => prev.map((s) => (itemKey(s) === key ? ({ ...s, ...patch } as SelectedCombinedItem) : s)));
    };

    const handleRoomModeChange = (room: SelectedRoomItem, mode: RoomPriceMode): void => {
        const source = roomPrices.find((r) => r.id === room.id);
        const newBasePrice = source ? (mode === "daily" ? source.dailyPrice : source.hourlyPrice) : room.customPrice;
        updateItem(itemKey(room), { priceMode: mode, customPrice: newBasePrice });
    };

    const handleNewOffer = async () => {
        if (!id) return;
        setSaving(true);
        try {
            const success = await uniNewOffer(Number(id), selected);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Árajánlat sikeresen elmentve.");
            setConfirmOpen(false);
            navigate(`/datasheet/${id}`);
        } finally {
            setSaving(false);
        }
    };

    const grandTotal = selected.reduce((sum, item) => sum + lineTotal(item), 0);

    const columns = useMemo<ColumnsType<SelectedCombinedItem>>(
        () => [
            {
                title: "Tétel",
                dataIndex: "name",
                key: "name",
                width: "20%",
                render: (value: string) => <span className="text-[12px] font-semibold text-[#3e484c]">{value}</span>,
            },
            {
                title: "Típus",
                key: "kind",
                width: "10%",
                render: (_, item) => (
                    <span className="text-[11px] text-[#3e484c]/60">{item.kind === "room" ? "Terem" : "Szolgáltatás"}</span>
                ),
            },
            {
                title: "Mód",
                key: "priceMode",
                width: "14%",
                render: (_, item) =>
                    item.kind === "room" ? (
                        <select
                            value={item.priceMode}
                            onChange={(e) => handleRoomModeChange(item, e.target.value as RoomPriceMode)}
                            className="w-full cursor-pointer rounded-md border border-[#3e484c]/15 bg-white px-2 py-1 text-[12px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                        >
                            <option value="daily">Napi</option>
                            <option value="hourly">Órás</option>
                        </select>
                    ) : (
                        <span className="text-[11px] text-[#3e484c]/30">-</span>
                    ),
            },
            {
                title: "Menny.",
                key: "quantity",
                width: "10%",
                render: (_, item) => (
                    <input
                        type="number"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => updateItem(itemKey(item), { quantity: Number(e.target.value) })}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1 text-[12px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                ),
            },
            {
                title: "Egyedi ár",
                key: "customPrice",
                width: "15%",
                render: (_, item) => (
                    <input
                        type="number"
                        min={0}
                        value={item.customPrice}
                        onChange={(e) => updateItem(itemKey(item), { customPrice: Number(e.target.value) })}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1 text-[12px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                ),
            },
            {
                title: "Kedv. %",
                key: "customDiscount",
                width: "10%",
                render: (_, item) => (
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.customDiscount}
                        onChange={(e) => updateItem(itemKey(item), { customDiscount: Number(e.target.value) })}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1 text-[12px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                ),
            },
            {
                title: "Sor összeg",
                key: "lineTotal",
                width: "16%",
                align: "right",
                render: (_, item) => <span className="text-[12px] font-semibold text-[#3e484c]">{formatFt(lineTotal(item))}</span>,
            },
            {
                title: "",
                key: "actions",
                width: "5%",
                align: "right",
                render: (_, item) => (
                    <button
                        onClick={() => removeItem(itemKey(item))}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[#3e484c]/40 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Eltávolítás"
                    >
                        <X size={13} />
                    </button>
                ),
            },
        ],
        [roomPrices]
    );

    return (
        <div className="flex w-full min-w-0 flex-col gap-6">
            <ConfirmModal
                open={confirmOpen}
                title="Árajánlat mentése"
                message={
                    <>
                        <p className="font-medium">Biztosan menteni szeretné az árajánlatot?</p>
                        <p className="mt-1 text-[#3e484c]/70">
                            A kiválasztott tételek összesen <span className="text-primary-light font-semibold">{formatFt(grandTotal)}</span>{" "}
                            értékben kerülnek elmentésre.
                        </p>
                    </>
                }
                confirmText="Mentés"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleNewOffer}
                confirmLoading={saving}
                confirmDisabled={selected.length === 0}
            />
            <div className="text-[#3e484c]">
                <h1 className="text-2xl font-bold">Terem és szolgáltatás árak hozzárendelése</h1>
                <p className="mt-0.5 text-sm text-[#3e484c]/60">
                    Válassza ki a termeket és szolgáltatásokat, és állítsa be az egyedi árakat az ajánlathoz.
                </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 min-[1200px]:grid-cols-[340px_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-center gap-1 rounded-md border border-[#3e484c]/10 bg-white p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab("room")}
                            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-semibold tracking-wide uppercase transition-colors ${
                                activeTab === "room" ? "bg-primary-light text-white" : "text-[#3e484c]/60 hover:bg-gray-50"
                            }`}
                        >
                            Termek
                        </button>
                        <button
                            onClick={() => setActiveTab("service")}
                            className={`flex-1 cursor-pointer rounded-md px-3 py-1.5 text-[12px] font-semibold tracking-wide uppercase transition-colors ${
                                activeTab === "service" ? "bg-primary-light text-white" : "text-[#3e484c]/60 hover:bg-gray-50"
                            }`}
                        >
                            Szolgáltatás
                        </button>
                    </div>

                    <div className="relative">
                        <svg
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Keresés..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-md border border-[#3e484c]/10 bg-white py-2 pr-4 pl-8 text-sm text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                        />
                    </div>

                    <div className="min-w-0 overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                        <div className="flex border-b border-[#3e484c]/10 px-4 py-2.5">
                            <span className="flex-1 text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">
                                {activeTab === "room" ? "Terem" : "Szolgáltatás"}
                            </span>
                            <span className="text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">
                                {activeTab === "room" ? "Napi / Órás díj" : "Díj"}
                            </span>
                        </div>

                        <div className="max-h-[520px] divide-y divide-[#3e484c]/8 overflow-y-auto">
                            {activeTab === "room" && (
                                <>
                                    {filteredRooms.length === 0 && (
                                        <p className="py-10 text-center text-sm text-[#3e484c]/40">Nincs találat.</p>
                                    )}
                                    {filteredRooms.map((room) => {
                                        const isAdded = selectedKeys.has(itemKey({ kind: "room", id: room.id }));
                                        return (
                                            <div
                                                key={room.id}
                                                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                                    isAdded ? "bg-blue-50/60" : "hover:bg-gray-50/70"
                                                }`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[12px] leading-snug font-semibold text-[#3e484c]">
                                                        {room.name}
                                                    </p>
                                                    <p className="truncate text-[11px] text-[#3e484c]/40">
                                                        {room.accommodation} · {room.type}
                                                    </p>
                                                </div>
                                                <div className="mr-2 flex shrink-0 flex-col items-end">
                                                    <span className="text-[11px] font-medium text-[#3e484c]/70">
                                                        {formatFt(room.dailyPrice)} / nap
                                                    </span>
                                                    <span className="text-[11px] text-[#3e484c]/40">
                                                        {formatFt(room.hourlyPrice)} / óra
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => addRoom(room)}
                                                    disabled={isAdded}
                                                    className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                                                        isAdded
                                                            ? "text-primary-light border-primary-light/20 bg-primary-light/10 cursor-default"
                                                            : "hover:border-primary-light/40 hover:bg-primary-light/80 border-[#3e484c]/15 bg-white text-[#3e484c]/60 hover:text-white"
                                                    }`}
                                                    title={isAdded ? "Már hozzáadva" : "Hozzáadás"}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            )}

                            {activeTab === "service" && (
                                <>
                                    {filteredServices.length === 0 && (
                                        <p className="py-10 text-center text-sm text-[#3e484c]/40">Nincs találat.</p>
                                    )}
                                    {filteredServices.map((service) => {
                                        const isAdded = selectedKeys.has(itemKey({ kind: "service", id: service.id }));
                                        return (
                                            <div
                                                key={service.id}
                                                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                                    isAdded ? "bg-blue-50/60" : "hover:bg-gray-50/70"
                                                }`}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[12px] leading-snug font-semibold text-[#3e484c]">
                                                        {service.name}
                                                    </p>
                                                </div>
                                                <div className="mr-2 flex shrink-0 flex-col items-end">
                                                    <span className="text-[11px] font-medium text-[#3e484c]/70">
                                                        {formatFt(service.price)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => addService(service)}
                                                    disabled={isAdded}
                                                    className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                                                        isAdded
                                                            ? "text-primary-light border-primary-light/20 bg-primary-light/10 cursor-default"
                                                            : "hover:border-primary-light/40 hover:bg-primary-light/80 border-[#3e484c]/15 bg-white text-[#3e484c]/60 hover:text-white"
                                                    }`}
                                                    title={isAdded ? "Már hozzáadva" : "Hozzáadás"}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-[13px] font-bold tracking-widest text-[#3e484c] uppercase">Kiválasztott tételek</h2>

                    <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                        <Table<SelectedCombinedItem>
                            rowKey={(item) => itemKey(item)}
                            columns={columns}
                            dataSource={selected}
                            pagination={false}
                            scroll={{ x: 760 }}
                            locale={{
                                emptyText: (
                                    <div className="py-10 text-center text-sm text-[#3e484c]/30">
                                        Még nem választott ki egyetlen tételt sem.
                                        <br />
                                        <span className="text-[11px]">Kattintson a + gombra a bal oldali listán.</span>
                                    </div>
                                ),
                            }}
                            summary={() =>
                                selected.length > 0 ? (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={8} className="!bg-gray-50/50 !px-5 !py-3.5 !text-right">
                                            <span className="text-[13px] font-bold text-[#3e484c]">
                                                Összesen: <span className="text-primary-light">{formatFt(grandTotal)}</span>
                                            </span>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                ) : null
                            }
                        />
                    </div>

                    {/* {selected.length > 0 && (
                        <div className="rounded-md border border-[#3e484c]/10 bg-white p-4 shadow-sm">
                            <label className="mb-1.5 block text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">
                                Megjegyzés
                            </label>
                            <textarea
                                rows={3}
                                placeholder="A kiválasztott tételek az alábbi ajánlathoz kerülnek hozzárendelésre..."
                                className="focus:ring-primary-light/40 w-full resize-none rounded-md border border-[#3e484c]/10 bg-gray-50/60 px-3 py-2 text-sm text-[#3e484c] placeholder:text-[#3e484c]/30 focus:ring-2 focus:outline-none"
                            />
                        </div>
                    )} */}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[#3e484c]/10 pt-5">
                <button className="cursor-pointer rounded-md border border-[#3e484c]/15 px-5 py-2 text-sm text-[#3e484c] transition-colors hover:bg-gray-50">
                    Mégse
                </button>
                <button
                    disabled={selected.length === 0}
                    onClick={handleNewOffer}
                    className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors ${
                        selected.length === 0
                            ? "bg-primary-light/30 cursor-not-allowed"
                            : "bg-primary-light hover:bg-primary-light/80 cursor-pointer"
                    }`}
                >
                    Mentés ({formatFt(grandTotal)})
                </button>
            </div>
        </div>
    );
};

export default UniPriceAssignPage;
