import { useRef, useState } from "react";
import { Modal } from "antd";
import { Download, FileText, Trash, Upload } from "lucide-react";
import { deleteDocuments } from "../actions/deleteDocuments";
import { downloadDocument } from "../actions/downloadDocument";
import { uploadDocument } from "../actions/uploadDocument";
import { DOCTYPES } from "../entitys/docTypes";
import { useSelector } from "../redux/store";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";

const DocumentsPage = () => {
    const { documents } = useSelector((state) => state.documents);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedType, setSelectedType] = useState<number | null>(null);

    const filtered = documents?.filter((document) => document.name.toLowerCase().includes(search.toLowerCase())) ?? [];

    const handleDelete = async () => {
        if (deletingId === null) return;
        await deleteDocuments(deletingId);
        setDeletingId(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        e.target.value = "";
    };

    const openUploadModal = () => {
        setSelectedFile(null);
        setSelectedType(null);
        setUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        if (uploading) return;

        setUploadModalOpen(false);
        setSelectedFile(null);
        setSelectedType(null);
    };

    const handleUpload = async () => {
        if (!selectedFile || selectedType === null) return;

        setUploading(true);
        try {
            const success = await uploadDocument(selectedFile, selectedType);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Dokumentum sikeresen feltöltve.");
            closeUploadModal();
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const formatDocumentType = (type?: number) => {
        if (type === DOCTYPES.Arajanlat) return "Árajánlat";
        if (type === DOCTYPES.Szerzodes) return "Szerződés";
        return "Ismeretlen típus";
    };

    const deletingDoc = documents?.find((document) => document.id === deletingId);

    return (
        <div className="flex w-full flex-col gap-4">
            <Modal
                title="Dokumentum törlése"
                open={deletingId !== null}
                onCancel={() => setDeletingId(null)}
                footer={
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex h-fit cursor-pointer flex-row gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                        >
                            Törlés
                        </button>
                    </div>
                }
            >
                <p className="text-sm text-[#3e484c]">
                    Biztosan törli a következő dokumentumot: <span className="font-medium">{deletingDoc?.name}</span>? Ez a művelet nem
                    vonható vissza.
                </p>
            </Modal>

            <Modal
                title="Dokumentum feltöltése"
                open={uploadModalOpen}
                onCancel={uploading ? undefined : closeUploadModal}
                footer={
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={closeUploadModal}
                            disabled={uploading}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || selectedType === null || uploading}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uploading ? "Feltöltés..." : "Feltöltés"}
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-4 py-2">
                    <div className="rounded-lg border border-[#3e484c]/10 bg-[#f7fafb] px-4 py-3">
                        <p className="text-xs font-semibold tracking-wide text-[#3e484c]/50 uppercase">Kiválasztott fájl</p>
                        <p className="mt-1 truncate text-sm font-medium text-[#3e484c]">{selectedFile?.name ?? "Nincs kiválasztva"}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <input ref={fileInputRef} type="file" accept=".docx,.doc,.pdf" className="hidden" onChange={handleFileSelect} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row items-center justify-center gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Upload size={16} />
                            {selectedFile ? "Másik fájl kiválasztása" : "Fájl kiválasztása"}
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">Dokumentum típusa</label>
                        <select
                            value={selectedType ?? ""}
                            onChange={(e) => setSelectedType(Number(e.target.value))}
                            className="w-full cursor-pointer rounded-md border border-[#3e484c]/10 bg-white px-3 py-2 text-sm text-[#3e484c] focus:ring-2 focus:ring-blue-400/40 focus:outline-none"
                        >
                            <option value="" disabled>
                                Válasszon típust...
                            </option>
                            <option value={DOCTYPES.Arajanlat}>Árajánlat</option>
                            <option value={DOCTYPES.Szerzodes}>Szerződés</option>
                        </select>
                    </div>
                </div>
            </Modal>

            <div className="flex w-full flex-col items-center justify-between gap-4 min-[800px]:flex-row">
                <div className="text-[#3e484c]">
                    <h1 className="flex-1 text-2xl font-bold">Dokumentumok</h1>
                    <p className="mt-0.5 max-w-md text-sm">Töltse fel és kezelje az elérhető dokumentumokat.</p>
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
                        onClick={openUploadModal}
                        disabled={uploading}
                        className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row items-center gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Upload size={16} />
                        Feltöltés
                    </button>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-md border border-[#3e484c]/10 bg-white py-20 shadow-sm">
                    <FileText size={36} className="mb-3 text-[#3e484c]/20" />
                    <p className="text-sm text-[#3e484c]/50">Nincs találat.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filtered.map((document) => (
                        <div
                            key={document.id}
                            className="group flex flex-col gap-3 rounded-md border border-[#3e484c]/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex-shrink-0 rounded-md bg-blue-50 p-2">
                                    <FileText size={20} className="text-blue-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-gray-800" title={document.name}>
                                        {document.name}
                                    </p>
                                    <p className="mt-1 text-[11px] font-medium text-[#3e484c]/70">{formatDocumentType(document.type)}</p>
                                    <p className="mt-0.5 text-[11px] text-[#3e484c]/50">{formatDate(document.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t border-[#3e484c]/5 pt-2">
                                <button
                                    onClick={() => downloadDocument(document.id, document.name)}
                                    className="text-primary-light flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50"
                                >
                                    <Download size={14} />
                                    Letöltés
                                </button>
                                <button
                                    onClick={() => setDeletingId(document.id)}
                                    className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                                    title="Törlés"
                                >
                                    <Trash size={14} />
                                    Törlés
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
