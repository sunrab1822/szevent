import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import OfferVersionsModal from "../components/OfferVersionsModal";
import { statusChange } from "../actions/statusChange";
import type { OfferLine, OfferType } from "../entitys/Offer";
import { ROLES } from "../entitys/roles";
import { useSelector } from "../redux/store";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import { formatFt } from "../utils/formatFt";
import { useSessionUser } from "../utils/useSessionUser";

const OFFER_TYPE_LABELS: Record<OfferType, string> = {
    famulus: "Famulus ajánlat",
    uni: "Egyetemi ajánlat",
    dorm: "Kollégiumi ajánlat",
};

const OFFER_ACCEPT_ROUTES: Partial<Record<OfferType, string>> = {
    famulus: "famulus/accept-offer",
    uni: "uni/accept-offer",
    dorm: "dorm/accept-offer",
};

const OFFER_REJECT_ROUTES: Partial<Record<OfferType, string>> = {
    famulus: "offer-modify",
    uni: "uni/offer-modify",
    dorm: "dorm/offer-modify",
};

const OfferReviewPage = () => {
    const navigate = useNavigate();
    const user = useSessionUser();
    const { eventId, offerType } = useParams();
    const { selectedVersion, versions } = useSelector((state) => state.offer);
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);
    const [saving, setSaving] = useState(false);

    const typedOfferType = (offerType as OfferType | undefined) ?? "famulus";

    const columns = useMemo<ColumnsType<OfferLine>>(
        () => [
            {
                title: "Tétel",
                dataIndex: "offer_name",
                key: "offer_name",
                width: "46%",
                render: (value: string) => <span className="text-[12px] font-semibold text-[#3e484c]">{value}</span>,
            },
            {
                title: "Mennyiség",
                dataIndex: "duration",
                key: "duration",
                width: "14%",
                render: (value: number) => <span className="text-[12px] text-[#3e484c]/70">{value}</span>,
            },
            {
                title: "Egységár",
                dataIndex: "price_per_unit",
                key: "price_per_unit",
                width: "20%",
                render: (value: number) => <span className="text-[12px] text-[#3e484c]/70">{formatFt(value)}</span>,
            },
            {
                title: "Sor összeg",
                dataIndex: "total_price",
                key: "total_price",
                width: "20%",
                align: "right",
                render: (value: number) => <span className="text-[12px] font-semibold text-[#3e484c]">{formatFt(value)}</span>,
            },
        ],
        []
    );

    if (!selectedVersion) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-24 text-[#3e484c]/40">
                <p className="text-sm">Az ajánlat verzió nem található.</p>
            </div>
        );
    }

    const grandTotal = selectedVersion.offers.reduce((sum, item) => sum + item.total_price, 0);
    const latestVersion = versions.reduce(
        (latest, version) => (latest === null || version.version > latest.version ? version : latest),
        null as (typeof versions)[number] | null
    );
    const isNewestVersion = latestVersion ? latestVersion.id === selectedVersion.id : true;
    const canManageOffer = user.role !== ROLES.FAMULUS;

    const handleAccept = async () => {
        const route = OFFER_ACCEPT_ROUTES[typedOfferType];
        if (!route || !eventId) return;

        setSaving(true);
        try {
            const success = await statusChange(route, Number(eventId));
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Árajánlat sikeresen elfogadva.");
            navigate(`/datasheet/${eventId}`);
        } finally {
            setSaving(false);
            setAcceptModalOpen(false);
        }
    };

    const handleReject = async () => {
        const route = OFFER_REJECT_ROUTES[typedOfferType];
        if (!route || !eventId) return;

        if (rejectReason.trim().length === 0) {
            setRejectReasonError(true);
            return;
        }

        setSaving(true);
        try {
            const success = await statusChange(route, Number(eventId), rejectReason.trim());
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Árajánlat sikeresen elutasítva.");
            navigate(`/datasheet/${eventId}`);
        } finally {
            setSaving(false);
            setRejectModalOpen(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <ConfirmModal
                open={acceptModalOpen}
                title="Ajánlat elfogadása"
                message="Biztosan el szeretné fogadni ezt az ajánlatot?"
                confirmText="Elfogadás"
                onCancel={() => setAcceptModalOpen(false)}
                onConfirm={handleAccept}
                confirmLoading={saving}
            />

            <OfferVersionsModal
                open={versionsModalOpen}
                onClose={() => setVersionsModalOpen(false)}
                versions={versions}
                currentVersionId={selectedVersion.id}
                onSelectVersion={(versionId) => navigate(`/offers/${eventId}/${typedOfferType}/${versionId}`)}
            />

            <div className="flex items-start justify-between text-[#3e484c]">
                <div>
                    <h1 className="text-2xl font-bold">{OFFER_TYPE_LABELS[typedOfferType]}</h1>
                    <p className="mt-0.5 text-sm text-[#3e484c]/60">
                        {selectedVersion.version}. verzió megtekintése az eseményhez tartozó ajánlatok közül.
                    </p>
                </div>
                {versions.length > 1 && (
                    <button
                        onClick={() => setVersionsModalOpen(true)}
                        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-[#3e484c]/15 bg-white px-3 py-2 text-sm text-[#3e484c] transition-colors hover:bg-gray-50"
                    >
                        <History size={14} />
                        Verziók
                    </button>
                )}
            </div>

            {selectedVersion.reason && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
                    <span className="font-medium">Megjegyzés:</span> {selectedVersion.reason}
                </div>
            )}

            <div className="overflow-hidden rounded-md border border-[#3e484c]/10 bg-white shadow-sm">
                <Table<OfferLine>
                    rowKey="id"
                    columns={columns}
                    dataSource={selectedVersion.offers}
                    pagination={false}
                    scroll={{ x: 700 }}
                    locale={{
                        emptyText: <div className="py-10 text-center text-sm text-[#3e484c]/30">Ez a verzió nem tartalmaz tételeket.</div>,
                    }}
                    summary={() => (
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} className="!bg-gray-50/50 !px-5 !py-3.5 !text-right">
                                <span className="text-[13px] font-bold text-[#3e484c]">
                                    Összesen: <span className="text-primary-light">{formatFt(grandTotal)}</span>
                                </span>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    )}
                />
            </div>

            {isNewestVersion && canManageOffer && (
                <div className="flex items-center justify-end gap-3 border-t border-[#3e484c]/10 pt-5">
                    <button
                        onClick={() => {
                            setRejectReason("");
                            setRejectReasonError(false);
                            setRejectModalOpen(true);
                        }}
                        disabled={saving}
                        className="flex cursor-pointer items-center gap-2 rounded-md border border-red-200 px-5 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Elutasítás
                    </button>
                    <button
                        onClick={() => setAcceptModalOpen(true)}
                        disabled={saving}
                        className="bg-primary-light hover:bg-primary-light/80 flex cursor-pointer items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Elfogadás
                    </button>
                </div>
            )}

            <Modal
                title="Ajánlat elutasítása"
                open={rejectModalOpen}
                onCancel={saving ? undefined : () => setRejectModalOpen(false)}
                width={480}
                footer={
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setRejectModalOpen(false)}
                            disabled={saving}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={saving}
                            className="flex h-fit cursor-pointer flex-row gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-500/80 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving ? "Mentés..." : "Elutasítás"}
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-1.5 py-2">
                    <label className="text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">Elutasítás indoka</label>
                    <textarea
                        rows={4}
                        value={rejectReason}
                        onChange={(e) => {
                            setRejectReason(e.target.value);
                            if (e.target.value.trim().length > 0) setRejectReasonError(false);
                        }}
                        placeholder="Adja meg, miért utasítja el az ajánlatot..."
                        className={`w-full resize-none rounded-md border bg-gray-50/60 px-3 py-2 text-sm text-[#3e484c] placeholder:text-[#3e484c]/30 focus:ring-2 focus:outline-none ${
                            rejectReasonError ? "border-red-300 focus:ring-red-300/40" : "focus:ring-primary-light/40 border-[#3e484c]/10"
                        }`}
                    />
                    {rejectReasonError && <p className="text-[11px] text-red-500">Az indoklás megadása kötelező.</p>}
                </div>
            </Modal>
        </div>
    );
};

export default OfferReviewPage;
