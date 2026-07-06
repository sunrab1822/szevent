import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import { famulusNewOffer } from "../../actions/famulusNewOffer";
import { PRICEVARIANTS } from "../../consts/PriceVariants";
import type { FamulusPrice, SelectedItem } from "../../entitys/famulusPrice";
import type { PriceVariantType } from "../../redux/type/PriceVariantType";
import { useSelector } from "../../redux/store";
import { showActionError, showActionSuccess } from "../../utils/actionFeedback";
import { formatFt } from "../../utils/formatFt";
import { parsePrice } from "../../utils/parsePrice";

const FamulusPriceAssignPage = () => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<SelectedItem[]>([]);
    // const [reason, setReason] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const famulusPrices = useSelector((state) => state.adminPrices.famulusPrices);
    const { id } = useParams();
    const navigate = useNavigate();

    const filtered = famulusPrices.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    const selectedIds = new Set(selected.map((s) => s.id));

    const addItem = (price: FamulusPrice): void => {
        if (selectedIds.has(price.id)) return;
        setSelected((prev) => [
            ...prev,
            {
                ...price,
                variant: "default",
                customPrice: parsePrice(price.default),
                customDiscount: 0,
                hours: 1,
            },
        ]);
    };

    const removeItem = (itemId: number): void => {
        setSelected((prev) => prev.filter((s) => s.id !== itemId));
    };

    const updateItem = (updated: SelectedItem): void => {
        setSelected((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    };

    const handleNewOffer = async () => {
        if (!id) return;
        setSaving(true);
        try {
            const success = await famulusNewOffer(Number(id), selected);
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

    const grandTotal = selected.reduce((sum, item) => sum + item.customPrice * item.hours, 0);

    const columns = useMemo<ColumnsType<SelectedItem>>(
        () => [
            {
                title: "Szolgáltatás",
                dataIndex: "name",
                key: "name",
                width: "30%",
                render: (value: string) => <span className="text-[12px] font-semibold text-[#3e484c]">{value}</span>,
            },
            {
                title: "Variáns",
                key: "variant",
                width: "20%",
                render: (_, item) => (
                    <select
                        value={item.variant}
                        onChange={(e) => {
                            const variant = e.target.value as PriceVariantType;
                            const newBase = parsePrice(item[variant]);
                            updateItem({ ...item, variant, customPrice: newBase, customDiscount: 0 });
                        }}
                        className="w-full appearance-none rounded-md border border-[#3e484c]/15 bg-white py-1.5 pr-2 pl-2.5 text-[11px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    >
                        {PRICEVARIANTS.map((v) => (
                            <option key={v.key} value={v.key}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                title: "Órák",
                key: "hours",
                width: "10%",
                render: (_, item) => (
                    <input
                        type="number"
                        min={1}
                        value={item.hours}
                        onChange={(e) => updateItem({ ...item, hours: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                        className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-center text-[11px] text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                    />
                ),
            },
            {
                title: "Egyedi ár",
                key: "customPrice",
                width: "15%",
                render: (_, item) => {
                    const basePrice = parsePrice(item[item.variant]);
                    return (
                        <input
                            type="number"
                            min={0}
                            value={item.customPrice}
                            onChange={(e) => {
                                const newPrice = parseFloat(e.target.value) || 0;
                                const discount = basePrice > 0 ? Math.round((1 - newPrice / basePrice) * 100) : 0;
                                updateItem({ ...item, customPrice: newPrice, customDiscount: discount });
                            }}
                            className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                        />
                    );
                },
            },
            {
                title: "Kedvezmény %",
                key: "customDiscount",
                width: "10%",
                render: (_, item) => {
                    const basePrice = parsePrice(item[item.variant]);
                    return (
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.customDiscount}
                            onChange={(e) => {
                                const discount = parseFloat(e.target.value) || 0;
                                const newPrice = Math.round(basePrice * (1 - discount / 100));
                                updateItem({ ...item, customDiscount: discount, customPrice: newPrice });
                            }}
                            className="w-full rounded-md border border-[#3e484c]/15 bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                        />
                    );
                },
            },
            {
                title: "Sor összeg",
                key: "lineTotal",
                width: "10%",
                align: "right",
                render: (_, item) => (
                    <span className="text-[12px] font-bold text-[#3e484c]">{formatFt(item.customPrice * item.hours)}</span>
                ),
            },
            {
                title: "",
                key: "actions",
                width: "5%",
                align: "right",
                render: (_, item) => (
                    <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Eltávolítás"
                    >
                        <Trash2 size={15} />
                    </button>
                ),
            },
        ],
        []
    );

    return (
        <div className="flex min-w-0 w-full flex-col gap-6">
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
                <h1 className="text-2xl font-bold">Árajánlat hozzárendelése</h1>
                <p className="mt-0.5 text-sm text-[#3e484c]/60">
                    Válassza ki a szolgáltatásokat és állítsa be az egyedi árakat az ajánlathoz.
                </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 min-[1200px]:grid-cols-[340px_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-3">
                    <h2 className="text-[13px] font-bold tracking-widest text-[#3e484c] uppercase">Elérhető szolgáltatások</h2>

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
                            <span className="flex-1 text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">Szolgáltatás</span>
                            <span className="text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">Példa díjak</span>
                        </div>

                        <div className="max-h-[520px] divide-y divide-[#3e484c]/8 overflow-y-auto">
                            {filtered.length === 0 && <p className="py-10 text-center text-sm text-[#3e484c]/40">Nincs találat.</p>}
                            {filtered.map((price) => {
                                const isAdded = selectedIds.has(price.id);
                                return (
                                    <div
                                        key={price.id}
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isAdded ? "bg-blue-50/60" : "hover:bg-gray-50/70"}`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[12px] leading-snug font-semibold text-[#3e484c]">{price.name}</p>
                                        </div>
                                        <div className="mr-2 flex shrink-0 flex-col items-end">
                                            <span className="text-[11px] font-medium text-[#3e484c]/70">{price.default}</span>
                                            <span className="text-[11px] text-[#3e484c]/40">{price.external}</span>
                                        </div>
                                        <button
                                            onClick={() => addItem(price)}
                                            disabled={isAdded}
                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
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
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-[13px] font-bold tracking-widest text-[#3e484c] uppercase">Kiválasztott tételek</h2>

                    <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                        <Table<SelectedItem>
                            rowKey="id"
                            columns={columns}
                            dataSource={selected}
                            pagination={false}
                            scroll={{ x: 600 }}
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
                                        <Table.Summary.Cell index={0} colSpan={7} className="!bg-gray-50/50 !px-5 !py-3.5 !text-right">
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
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
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
                    onClick={() => setConfirmOpen(true)}
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

export default FamulusPriceAssignPage;
