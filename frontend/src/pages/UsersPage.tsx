import { useState } from "react";
import { ROLES } from "../entitys/roles";
import { Plus, ShieldCheck, Trash } from "lucide-react";
import { Modal, Table } from "antd";
import { useSelector } from "../redux/store";
import type { User } from "../entitys/user";
import { setUserRole } from "../actions/setUserRole";
import type { ColumnsType } from "antd/es/table";
import { addUser } from "../actions/addUser";
import { deleteUser } from "../actions/deleteUser";
import ConfirmModal from "../components/ConfirmModal";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";

type RoleValue = (typeof ROLES)[keyof typeof ROLES];

const ROLE_LABELS: Record<RoleValue, string> = {
    [ROLES.ADMIN]: "Admin",
    [ROLES.ORGANIZER]: "Rendezvényszervező",
    [ROLES.FAMULUS]: "Famulus",
    [ROLES.LEGAL]: "Jogi osztály",
    [ROLES.DORM]: "Kollégium",
};

const ROLE_BADGE_STYLES: Record<RoleValue, string> = {
    [ROLES.ADMIN]: "bg-red-100 text-red-700",
    [ROLES.ORGANIZER]: "bg-primary-light/10 text-primary-light",
    [ROLES.FAMULUS]: "bg-blue-100 text-blue-700",
    [ROLES.LEGAL]: "bg-amber-100 text-amber-700",
    [ROLES.DORM]: "bg-green-100 text-green-700",
};

interface EditingState {
    userId: number;
    currentRole: RoleValue;
    selectedRole: RoleValue;
    userName: string;
}

interface DeleteState {
    id: number;
    name: string;
}

const UsersPage = () => {
    const { users } = useSelector((state) => state.users);
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<EditingState | false>(false);
    const [saving, setSaving] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addUserName, setAddUserName] = useState("");
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<DeleteState | false>(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const filtered = (users as User[]).filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenEdit = (user: User) => {
        setEditing({
            userId: user.id,
            currentRole: user.role,
            selectedRole: user.role,
            userName: user.name,
        });
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            await setUserRole(editing.userId, editing.selectedRole);
        } finally {
            setSaving(false);
            setEditing(false);
        }
    };

    const handleAdd = async () => {
        if (adding) return;
        setAdding(true);
        try {
            await addUser(addUserName);
        } finally {
            setAddUserName("");
            setAdding(false);
            setAddModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (!deleting) return;

        setDeleteLoading(true);
        try {
            const success = await deleteUser(deleting.id);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Felhasználó sikeresen törölve.");
            setDeleting(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: "Felhasználó",
            key: "displayName",
            width: "35%",
            className: "pl-5",
            render: (_, record: User) => <span className="text-[12px] font-medium text-gray-800">{record.displayName || record.name}</span>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: "35%",
            render: (email: string) => <span className="text-[13px] text-[#3e484c]">{email}</span>,
        },
        {
            title: "Szerepkör",
            dataIndex: "role",
            key: "role",
            width: "20%",
            render: (role: RoleValue) => (
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_STYLES[role] ?? "bg-gray-100 text-gray-600"}`}
                >
                    {ROLE_LABELS[role] ?? `Nincs`}
                </span>
            ),
        },
        {
            title: "Műveletek",
            key: "actions",
            width: "10%",
            align: "right",
            className: "pr-5",
            render: (_, user) => (
                <div className="flex w-full items-center justify-end gap-1">
                    <button
                        onClick={() => handleOpenEdit(user)}
                        className="text-primary-light hover:bg-primary-light/10 cursor-pointer rounded-lg p-2 transition-colors"
                        title="Szerepkör módosítása"
                    >
                        <ShieldCheck size={20} />
                    </button>
                    <button
                        onClick={() => setDeleting({ id: user.id, name: user.displayName || user.name })}
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
            <ConfirmModal
                open={deleting !== false}
                title="Felhasználó törlése"
                message={
                    <span>
                        Biztosan törli a következő felhasználót: <span className="font-medium">{deleting ? deleting.name : ""}</span>?
                    </span>
                }
                onCancel={() => setDeleting(false)}
                onConfirm={handleDelete}
                confirmText="Törlés"
                confirmLoading={deleteLoading}
                danger
            />

            <Modal
                title="Szerepkör módosítása"
                open={editing !== false}
                onCancel={() => setEditing(false)}
                footer={
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setEditing(false)}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:opacity-60"
                        >
                            {saving ? "Mentés..." : "Mentés"}
                        </button>
                    </div>
                }
            >
                {editing && (
                    <div className="flex flex-col gap-4 py-2">
                        <p className="text-sm text-[#3e484c]">
                            <span className="font-medium">{editing.userName}</span> felhasználó szerepkörének beállítása:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {(Object.entries(ROLES) as [string, RoleValue][]).map(([key, value]) => (
                                <label
                                    key={key}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                        editing.selectedRole === value
                                            ? "border-primary-light bg-blue-50/60"
                                            : "border-[#3e484c]/10 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={value}
                                        checked={editing.selectedRole === value}
                                        onChange={() => setEditing((prev) => (prev !== false ? { ...prev, selectedRole: value } : prev))}
                                        className="accent-primary-light"
                                    />
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_STYLES[value]}`}>
                                        {ROLE_LABELS[value]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="Felhasználó hozzáadása"
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                footer={
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setAddModalOpen(false)}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={adding}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:opacity-60"
                        >
                            {adding ? "Hozzáadás..." : "Hozzáadás"}
                        </button>
                    </div>
                }
            >
                <div className="flex max-h-[70vh] w-full flex-col gap-4">
                    <div>
                        <label htmlFor={"name"}>Azonosító</label>
                        <input
                            type="text"
                            name={"name"}
                            placeholder="ABC123"
                            value={addUserName}
                            onChange={(e) => setAddUserName(e.target.value)}
                            className="w-full rounded-md border border-[#3e484c]/10 bg-white px-2 py-2 text-sm text-[#3e484c]"
                        />
                    </div>
                </div>
            </Modal>

            <div className="flex w-full flex-col items-center justify-between gap-4 min-[800px]:flex-row">
                <div className="text-[#3e484c]">
                    <h1 className="flex-1 text-2xl font-bold">Felhasználók</h1>
                    <p className="mt-0.5 max-w-md text-sm">Kezelje a felhasználók szerepköreit és hozzáférési szintjeit.</p>
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
                                placeholder="Keresés név vagy email alapján..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-md border border-[#3e484c]/10 bg-white py-2 pr-4 pl-8 text-sm text-[#3e484c]"
                            />
                        </div>
                    </div>
                    <button
                        className="bg-primary-light flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                        onClick={() => setAddModalOpen(true)}
                    >
                        <Plus />
                        Új hozzáadása
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                <Table<User>
                    dataSource={filtered}
                    columns={columns}
                    rowKey="id"
                    rowClassName={(_, i) =>
                        `border-b border-[#3e484c]/10 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-100/40"}`
                    }
                    locale={{ emptyText: <span className="text-sm text-[#3e484c]">Nincs találat.</span> }}
                    pagination={false}
                    className="[&_.ant-table-cell]:px-2 [&_.ant-table-thead_th]:border-b [&_.ant-table-thead_th]:border-[#3e484c]/10 [&_.ant-table-thead_th]:bg-white [&_.ant-table-thead_th]:py-3.5 [&_.ant-table-thead_th]:text-[10px] [&_.ant-table-thead_th]:font-semibold [&_.ant-table-thead_th]:tracking-wide [&_.ant-table-thead_th]:text-[#3e484c] [&_.ant-table-thead_th]:uppercase"
                />
            </div>
        </div>
    );
};

export default UsersPage;
