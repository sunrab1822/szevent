import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, Upload } from "lucide-react";
import { Modal } from "antd";
import { downloadDocument } from "../actions/downloadDocument";
import { getNeededDocuments } from "../actions/getNeededDocuments";
import type { Document } from "../entitys/document";
import { showActionError } from "../utils/actionFeedback";
import ConfirmModal from "./ConfirmModal";

interface LegalDocumentReviewModalProps {
    eventId: number;
    open: boolean;
    onClose: () => void;
    onConfirmSave: (files: File[]) => Promise<boolean>;
    confirmLoading: boolean;
}

interface ReviewedDocumentState {
    downloaded: boolean;
    uploadedFile: File | null;
}

const ACCEPTED_FILE_TYPES = ".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const LegalDocumentReviewModal = ({ eventId, open, onClose, onConfirmSave, confirmLoading }: LegalDocumentReviewModalProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentStates, setDocumentStates] = useState<Record<number, ReviewedDocumentState>>({});
    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const loadDocuments = async () => {
            setLoading(true);
            try {
                const neededDocuments = await getNeededDocuments(eventId);
                if (neededDocuments === false) {
                    setDocuments([]);
                    showActionError();
                    return;
                }

                setDocuments(neededDocuments);
                setDocumentStates((prev) => {
                    const nextState: Record<number, ReviewedDocumentState> = {};

                    neededDocuments.forEach((document) => {
                        nextState[document.id] = prev[document.id] ?? {
                            downloaded: false,
                            uploadedFile: null,
                        };
                    });

                    return nextState;
                });
            } finally {
                setLoading(false);
            }
        };

        void loadDocuments();
    }, [eventId, open]);

    const completedCount = useMemo(
        () => documents.filter((document) => documentStates[document.id]?.downloaded && documentStates[document.id]?.uploadedFile).length,
        [documentStates, documents]
    );

    const canSave =
        documents.length > 0 &&
        documents.every((document) => documentStates[document.id]?.downloaded && documentStates[document.id]?.uploadedFile !== null);

    const handleDownload = async (document: Document) => {
        await downloadDocument(document.id, document.name);
        setDocumentStates((prev) => ({
            ...prev,
            [document.id]: {
                downloaded: true,
                uploadedFile: prev[document.id]?.uploadedFile ?? null,
            },
        }));
    };

    const handleFileChange = (documentId: number, file: File | null) => {
        if (!file) return;

        const lowerCaseName = file.name.toLowerCase();
        const isAcceptedType = lowerCaseName.endsWith(".docx") || lowerCaseName.endsWith(".pdf");

        if (!isAcceptedType) {
            return;
        }

        setDocumentStates((prev) => ({
            ...prev,
            [documentId]: {
                downloaded: prev[documentId]?.downloaded ?? false,
                uploadedFile: file,
            },
        }));
    };

    const handleSave = async () => {
        const files = documents
            .map((document) => documentStates[document.id]?.uploadedFile)
            .filter((file): file is File => file instanceof File);

        const success = await onConfirmSave(files);
        if (success) {
            setConfirmOpen(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("hu-HU", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    return (
        <>
            <ConfirmModal
                open={confirmOpen}
                title="Dokumentumok mentése"
                message={
                    <>
                        <p className="font-medium">Biztosan menteni szeretné a feltöltött dokumentumokat?</p>
                        <p className="mt-1 text-[#3e484c]/70">
                            {documents.length} kapcsolódó dokumentum került áttekintésre, és {completedCount} feltöltött fájl kerül elküldésre.
                        </p>
                    </>
                }
                confirmText="Mentés"
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleSave}
                confirmLoading={confirmLoading}
                confirmDisabled={!canSave}
            />

            <Modal
                title="Szerződések áttekintése"
                open={open}
                onCancel={confirmLoading ? undefined : onClose}
                width={760}
                footer={
                    <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="text-left text-xs text-[#3e484c]/60">
                            {completedCount} / {documents.length} dokumentum teljesítve
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                disabled={confirmLoading}
                                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Mégse
                            </button>
                            <button
                                onClick={() => setConfirmOpen(true)}
                                disabled={!canSave || confirmLoading}
                                className="bg-primary-light hover:bg-primary-light/80 flex h-fit cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Mentés
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="mb-4 rounded-lg border border-[#3e484c]/10 bg-[#f7fafb] px-4 py-3 text-sm text-[#3e484c]/80">
                    Töltse le az összes kapcsolódó dokumentumot legalább egyszer, majd mindegyikhez töltsön fel egy `.docx` vagy `.pdf` fájlt.
                </div>

                <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-1">
                    {loading && <div className="py-10 text-center text-sm text-[#3e484c]/40">Dokumentumok betöltése...</div>}

                    {!loading && documents.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#3e484c]/15 py-12 text-[#3e484c]/40">
                            <FileText size={34} className="mb-2" />
                            <p className="text-sm">Ehhez az eseményhez nincs kapcsolódó dokumentum.</p>
                        </div>
                    )}

                    {!loading &&
                        documents.map((document) => {
                            const documentState = documentStates[document.id];
                            const downloaded = documentState?.downloaded ?? false;
                            const uploadedFile = documentState?.uploadedFile ?? null;

                            return (
                                <div key={document.id} className="rounded-xl border border-[#3e484c]/10 bg-white p-4 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-md bg-blue-50 p-2">
                                                    <FileText size={18} className="text-blue-500" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-[#3e484c]">{document.name}</p>
                                                    <p className="mt-1 text-xs text-[#3e484c]/50">{formatDate(document.created_at)}</p>
                                                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 font-medium ${
                                                                downloaded ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                                            }`}
                                                        >
                                                            {downloaded ? "Letöltve" : "Letöltés szükséges"}
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 font-medium ${
                                                                uploadedFile ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                                            }`}
                                                        >
                                                            {uploadedFile ? `Feltöltve: ${uploadedFile.name}` : "Feltöltés hiányzik"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <button
                                                onClick={() => void handleDownload(document)}
                                                className="text-primary-light flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-100"
                                            >
                                                <Download size={14} />
                                                Letöltés
                                            </button>

                                            <label
                                                className={`flex items-center justify-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                                    downloaded
                                                        ? "bg-primary-light hover:bg-primary-light/80 cursor-pointer text-white"
                                                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                                                }`}
                                            >
                                                <Upload size={14} />
                                                {uploadedFile ? "Fájl cseréje" : "Feltöltés"}
                                                <input
                                                    type="file"
                                                    accept={ACCEPTED_FILE_TYPES}
                                                    disabled={!downloaded}
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        handleFileChange(document.id, event.target.files?.[0] ?? null);
                                                        event.target.value = "";
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {downloaded && uploadedFile && (
                                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                                            <CheckCircle2 size={14} />
                                            A dokumentum feldolgozása kész, menthető.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </Modal>
        </>
    );
};

export default LegalDocumentReviewModal;
