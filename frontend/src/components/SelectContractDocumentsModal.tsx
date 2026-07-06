import { useEffect, useState } from "react";
import { Check, FileText } from "lucide-react";
import { Modal } from "antd";
import type { Document } from "../entitys/document";
import { useSelector } from "../redux/store";

interface SelectContractDocumentsModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (documentIds: number[]) => void;
}

const SelectContractDocumentsModal = ({ open, onClose, onSubmit }: SelectContractDocumentsModalProps) => {
    const { documents } = useSelector((state) => state.documents);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            setSelectedIds([]);
        }
    }, [open]);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <Modal
            title="Szerződések kiválasztása"
            open={open}
            onCancel={onClose}
            width={560}
            footer={
                <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs text-[#3e484c]/50">{selectedIds.length} dokumentum kiválasztva</span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={() => onSubmit(selectedIds)}
                            disabled={selectedIds.length === 0}
                            className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Kiválasztás
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto py-2 pr-1">
                {documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-[#3e484c]/40">
                        <FileText size={32} className="mb-2" />
                        <p className="text-sm">Nincs elérhető dokumentum.</p>
                    </div>
                )}
                {documents.map((document: Document) => {
                    const selected = selectedIds.includes(document.id);

                    return (
                        <div
                            key={document.id}
                            onClick={() => toggleSelect(document.id)}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                selected ? "border-primary-light bg-blue-50/60" : "border-[#3e484c]/10 hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex-shrink-0 rounded-md bg-blue-50 p-2">
                                <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-gray-800">{document.name}</p>
                                <p className="text-[11px] text-[#3e484c]/50">{formatDate(document.created_at)}</p>
                            </div>
                            <div
                                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                                    selected ? "border-primary-light bg-primary-light" : "border-[#3e484c]/20 bg-white"
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

export default SelectContractDocumentsModal;
