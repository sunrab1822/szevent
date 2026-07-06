import { useState } from "react";
import { useSelector } from "../redux/store";
import { Pencil, Plus, Trash } from "lucide-react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ServicePrices } from "../entitys/servicePrices";
import { saveServicePrice } from "../actions/saveServicePrice";
import { deleteServicePrice } from "../actions/deleteServicePrice";

const COLS = [
    { key: "price", label: "Ár" },
    { key: "quantity", label: "Alkalom" },
] as const;

const ServicesAdminPricePage = () => {
    const { servicePrices } = useSelector((state) => state.adminPrices);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<null | ServicePrices | false>(false);

    const filtered = servicePrices.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

    const handleDelete = async (id: number) => {
        await deleteServicePrice(id);
    };

    const handleSave = async () => {
        if (editing === false) return;

        const isNew = !(editing as ServicePrices)?.id;
        const payload = {
            ...(editing !== null && { id: (editing as ServicePrices).id }),
            name: (editing as ServicePrices)?.name,
            price: (editing as ServicePrices)?.price,
            quantity: (editing as ServicePrices)?.quantity,
        };

        await saveServicePrice(payload, isNew);

        setEditing(false);
    };

    const handleInput = (_id: number, key: string, value: string) => {
        setEditing((prev) => (prev !== false ? { ...(prev as ServicePrices), [key]: value } : prev));
    };

    const columns: ColumnsType<ServicePrices> = [
        {
            title: "Szolgáltatás",
            dataIndex: "name",
            key: "name",
            width: "45%",
            render: (value: string) => <span className="text-[12px] font-medium text-gray-800">{value}</span>,
        },
        ...COLS.map(
            (col) =>
                ({
                    title: col.label,
                    dataIndex: col.key,
                    key: col.key,
                    width: "22.5%",
                    render: (value: string | number) => <span className="text-[12px] font-semibold text-[#3e484c]">{value}</span>,
                }) satisfies ColumnsType<ServicePrices>[number]
        ),
        {
            title: "Műveletek",
            key: "actions",
            width: "10%",
            align: "right",
            render: (_, row) => (
                <div className="flex w-full items-center justify-end gap-1">
                    <button
                        onClick={() => setEditing(row)}
                        className="text-primary-light cursor-pointer rounded-lg p-2 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="Szerkesztés"
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="cursor-pointer rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Törlés"
                    >
                        <Trash size={20} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex w-full flex-col gap-4">
            <Modal
                title={!(editing as ServicePrices)?.id ? "Szolgáltatás hozzáadása" : "Szolgáltatás szerkesztése"}
                open={editing !== false}
                onCancel={() => setEditing(false)}
                cancelButtonProps={{ style: { display: "none" } }}
                okText="Mentés"
                onOk={() => handleSave()}
                footer={
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors"
                        >
                            Mentés
                        </button>
                    </div>
                }
            >
                <div className="flex max-h-[70vh] w-full flex-col gap-4">
                    <div>
                        <label htmlFor="name">Szolgáltatás</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Takarítás..."
                            value={(editing as ServicePrices)?.name ?? ""}
                            onChange={(e) => handleInput(0, "name", e.target.value)}
                            className="w-full rounded-md border border-[#3e484c]/10 bg-white px-2 py-2 text-sm text-[#3e484c]"
                        />
                    </div>
                    {COLS.map((c, idx) => (
                        <div key={idx}>
                            <label htmlFor={c.key}>{c.label}</label>
                            <input
                                type="text"
                                name={c.key}
                                placeholder="123..."
                                value={(editing as ServicePrices)?.[c.key as keyof ServicePrices] ?? ""}
                                onChange={(e) => handleInput(0, c.key, e.target.value)}
                                className="w-full rounded-md border border-[#3e484c]/10 bg-white px-2 py-2 text-sm text-[#3e484c]"
                            />
                        </div>
                    ))}
                </div>
            </Modal>
            <div className="flex w-full flex-col items-center justify-between gap-4 min-[800px]:flex-row">
                <div className="text-[#3e484c]">
                    <h1 className="flex-1 text-2xl font-bold">Szolgáltatások Árlista</h1>
                    <p className="mt-0.5 max-w-md text-sm">
                        Kezelje az összes elérhető szolgáltatás árazási szintjeit a különböző működési ablakokhoz.
                    </p>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex min-w-[350px] flex-shrink-0 items-center gap-2">
                        <div className="relative w-full">
                            <svg
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                width="14"
                                height="14"
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
                                className="w-full rounded-md border border-[#3e484c]/10 bg-white py-2 pr-4 pl-8 text-sm text-[#3e484c]"
                            />
                        </div>
                    </div>
                    <button
                        className="bg-primary-light flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                        onClick={() => setEditing(null)}
                    >
                        <Plus />
                        Új hozzáadása
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                <Table<ServicePrices>
                    rowKey="id"
                    columns={columns}
                    dataSource={filtered}
                    pagination={false}
                    scroll={{ x: 900 }}
                    locale={{ emptyText: "Nincs találat." }}
                />
            </div>
        </div>
    );
};

export default ServicesAdminPricePage;
