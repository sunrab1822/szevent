import { Modal } from "antd";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { downloadFileFromUrl } from "../actions/downloadFileFromUrl";
import { getDownloadableDocuments } from "../actions/getDownloadableDocuments";
import { openFileFromUrl } from "../actions/openFileFromUrl";
import type { DownloadableDocument } from "../entitys/downloadableDocument";
import { showActionError } from "../utils/actionFeedback";

interface DownloadableDocumentsModalProps {
    eventId: number;
    open: boolean;
    onClose: () => void;
}

const formatSize = (size: number | null) => {
    if (!size) return null;

    if (size < 1024 * 1024) {
        return `${Math.round(size / 1024)} KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const DownloadableDocumentsModal = ({ eventId, open, onClose }: DownloadableDocumentsModalProps) => {
    const [documents, setDocuments] = useState<DownloadableDocument[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;

        const loadDocuments = async () => {
            setLoading(true);
            try {
                const downloadableDocuments = await getDownloadableDocuments(eventId);
                if (downloadableDocuments === false) {
                    setDocuments([]);
                    showActionError();
                    return;
                }

                setDocuments(downloadableDocuments);
            } finally {
                setLoading(false);
            }
        };

        void loadDocuments();
    }, [eventId, open]);

    const handleOpenDocument = async (documentUrl: string) => {
        const success = await openFileFromUrl(documentUrl);
        if (!success) {
            showActionError();
        }
    };

    const handleDownloadDocument = async (document: DownloadableDocument) => {
        const success = await downloadFileFromUrl(document.url, document.filename ?? document.label);
        if (!success) {
            showActionError();
        }
    };

    return (
        <Modal
            title="Dokumentumok"
            open={open}
            onCancel={onClose}
            width={640}
            footer={
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Bezárás
                    </button>
                </div>
            }
        >
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto py-2 pr-1">
                {loading && <div className="py-10 text-center text-sm text-[#3e484c]/40">Dokumentumok betöltése...</div>}

                {!loading && documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-[#3e484c]/40">
                        <FileText size={32} className="mb-2" />
                        <p className="text-sm">Nincs elérhető dokumentum.</p>
                    </div>
                )}

                {!loading &&
                    documents.map((document) => {
                        const formattedSize = formatSize(document.size);

                        return (
                        <div
                            key={document.key}
                            role="button"
                            tabIndex={0}
                            onClick={() => void handleOpenDocument(document.url)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    void handleOpenDocument(document.url);
                                }
                            }}
                            className="hover:border-primary-light flex cursor-pointer items-center gap-3 rounded-lg border border-[#3e484c]/10 px-4 py-3 text-left transition-colors hover:bg-blue-50/60"
                        >
                            <div className="flex-shrink-0 rounded-md bg-blue-50 p-2">
                                <FileText size={18} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-gray-800" title={document.label}>
                                    {document.label}
                                </p>
                                <p className="text-[11px] text-[#3e484c]/50">
                                    {document.filename ?? document.category}
                                    {formattedSize ? ` · ${formattedSize}` : ""}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    void handleDownloadDocument(document);
                                }}
                                className="text-primary-light flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium transition-colors hover:bg-blue-100"
                            >
                                <Download size={14} />
                                Letöltés
                            </button>
                        </div>
                        );
                    })}
            </div>
        </Modal>
    );
};

export default DownloadableDocumentsModal;
