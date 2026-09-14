import { Modal } from "antd";
import { Download, FileClock } from "lucide-react";
import { downloadFileFromUrl } from "../actions/downloadFileFromUrl";
import type { OfferVersion } from "../entitys/Offer";
import { showActionError } from "../utils/actionFeedback";

interface OfferVersionsModalProps {
    open: boolean;
    onClose: () => void;
    versions: OfferVersion[];
    currentVersionId?: number | null;
    onSelectVersion: (versionId: number) => void;
}

const formatDate = (iso?: string) =>
    iso
        ? new Date(iso).toLocaleDateString("hu-HU", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "Ismeretlen dátum";

const OfferVersionsModal = ({ open, onClose, versions, currentVersionId, onSelectVersion }: OfferVersionsModalProps) => {
    const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

    const handleDownloadVersion = async (version: OfferVersion) => {
        const success = await downloadFileFromUrl(
            `/api/version/${version.id}/offer-summary`,
            `arajanlat-${version.offer_type}-${version.version}-verzio.docx`
        );

        if (!success) {
            showActionError();
        }
    };

    return (
        <Modal
            title="Árajánlat verziói"
            open={open}
            onCancel={onClose}
            width={560}
            footer={
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Mégse
                    </button>
                </div>
            }
        >
            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto py-2 pr-1">
                {sortedVersions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-[#3e484c]/40">
                        <FileClock size={32} className="mb-2" />
                        <p className="text-sm">Nincs elérhető verzió.</p>
                    </div>
                )}
                {sortedVersions.map((version) => {
                    const isCurrent = currentVersionId === version.id || version.current;

                    return (
                        <div
                            key={version.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                                onSelectVersion(version.id);
                                onClose();
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelectVersion(version.id);
                                    onClose();
                                }
                            }}
                            className="hover:border-primary-light flex cursor-pointer items-center gap-3 rounded-lg border border-[#3e484c]/10 px-4 py-3 text-left transition-colors hover:bg-blue-50/60"
                        >
                            <div className="flex-shrink-0 rounded-md bg-blue-50 p-2">
                                <FileClock size={18} className="text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate text-[13px] font-medium text-gray-800">{version.version}. verzió</p>
                                    {isCurrent && (
                                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-500 uppercase">
                                            Jelenleg tekintett
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#3e484c]/50">{formatDate(version.created_at)}</p>
                                {version.reason && <p className="mt-0.5 truncate text-[11px] text-[#3e484c]/70">Indok: {version.reason}</p>}
                            </div>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    void handleDownloadVersion(version);
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

export default OfferVersionsModal;
