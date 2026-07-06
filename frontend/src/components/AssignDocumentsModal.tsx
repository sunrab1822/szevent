import { useState } from "react";
import { useSelector } from "../redux/store";
import { Modal } from "antd";
import { FileText, Check } from "lucide-react";
import { assignDocumentsToEvent } from "../actions/assignDocumentsToEvent";
import type { Document as EventDocument } from "../entitys/document";

interface AssignDocumentsModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AssignDocumentsModal = ({ open, onClose, onSuccess }: AssignDocumentsModalProps) => {
    const { documents } = useSelector((state) => state.documents);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const { id } = useSelector((state) => state.event.selectedEvent!);
    const [saving, setSaving] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleConfirm = async () => {
        if (selectedIds.length === 0) return;
        setSaving(true);
        try {
            await assignDocumentsToEvent(id, selectedIds);
            onSuccess();
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <Modal
            title="Dokumentumok hozzárendelése"
            open={open}
            onCancel={onClose}
            width={560}
            footer={
                <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-[#3e484c]/50">{selectedIds.length} dokumentum kiválasztva</span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedIds.length === 0 || saving}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Mentés..." : "Hozzárendelés"}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto py-2 pr-1">
                {documents?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-[#3e484c]/40">
                        <FileText size={32} className="mb-2" />
                        <p className="text-sm">Nincs elérhető dokumentum.</p>
                    </div>
                )}
                {documents?.map((doc: EventDocument) => {
                    const selected = selectedIds.includes(doc.id);
                    return (
                        <div
                            key={doc.id}
                            onClick={() => toggleSelect(doc.id)}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                selected ? "border-primary-light bg-blue-50/60" : "border-[#3e484c]/10 hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex-shrink-0 rounded-md bg-blue-50 p-2">
                                <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-gray-800">{doc.name}</p>
                                <p className="text-[11px] text-[#3e484c]/50">{formatDate(doc.created_at)}</p>
                            </div>
                            <div
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                                    selected ? "bg-primary-light border-primary-light" : "border-[#3e484c]/20 bg-white"
                                }`}
                            >
                                {selected && <Check size={12} className="text-white" />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Modal>
    );
};

export default AssignDocumentsModal;
