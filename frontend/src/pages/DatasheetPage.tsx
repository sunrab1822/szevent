import {
    Ban,
    Check,
    ChevronDown,
    DollarSign,
    Eye,
    FileText,
    MoreHorizontal,
    Pencil,
    Save,
    Search,
    UserRoundMinus,
    UserRoundPlus,
    X,
} from "lucide-react";
import { useState } from "react";
import { Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useRevalidator } from "react-router-dom";
import { addOrganizerToEvent } from "../actions/addOrganizerToEvent";
import { changeQualification } from "../actions/changeQualification";
import { getEvent } from "../actions/getEvent";
import { getOfferVersions } from "../actions/getOfferVersions";
import { saveEvent } from "../actions/saveEvent";
import { selectContractDocuments } from "../actions/selectContractDocuments";
import { statusChange } from "../actions/statusChange";
import AssignDocumentsModal from "../components/AssignDocumentsModal";
import ChatHistory from "../components/ChatHistory";
import ConfirmModal from "../components/ConfirmModal";
import DetailRow from "../components/DetailRow";
import DownloadableDocumentsModal from "../components/DownloadableDocumentsModal";
import OfferVersionsModal from "../components/OfferVersionsModal";
import SelectContractDocumentsModal from "../components/SelectContractDocumentsModal";
import type { OfferType } from "../entitys/Offer";
import { eventSections } from "../entitys/datasheetConfig";
import { ROLES } from "../entitys/roles";
import { EditSelectedEvent } from "../redux/action/events/editSelectedEvent";
import { SetSidebarOpen } from "../redux/action/globalProps/setSidebarOpen";
import { useSelector } from "../redux/store";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import StatusHistory from "../components/StatusHistory";
import { useSessionUser } from "../utils/useSessionUser";
import { isLockedEventStatus } from "../utils/eventStatus";

const LEGAL_STATUS_ACTIONS: Record<string, { buttonLabel: string; route: string; successMessage: string }> = {
    "Partneri aláírásra vár": {
        buttonLabel: "Ügyfél által aláírva",
        route: "legal/accept-client",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Egyetemi aláírásra vár": {
        buttonLabel: "Egyetem által aláírva",
        route: "legal/accept-uni",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Szerződés kiküldésre vár": {
        buttonLabel: "Szerződés postázva",
        route: "legal/signed",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "TIG jóváhagyásra vár": {
        buttonLabel: "TIG jóváhagyva",
        route: "legal/informantwaiting",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Adatközlő felküldésére vár": {
        buttonLabel: "Adatközlő felküdve",
        route: "legal/informantdone",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Adatközlő felküldve": {
        buttonLabel: "Rendezvény lezárása",
        route: "legal/finish",
        successMessage: "Rendezvény sikeresen lezárva.",
    },
};

const DatasheetPage = () => {
    const dispatch = useDispatch();
    const revalidator = useRevalidator();
    const navigate = useNavigate();
    const user = useSessionUser();
    const { selectedEvent } = useSelector((state) => state.event);
    const { users } = useSelector((state) => state.users);
    const { versions } = useSelector((state) => state.offer);
    const [isEditing, setIsEditing] = useState(false);
    const [openSections, setOpenSections] = useState<number[]>([0]);
    const [openOrganizersModal, setOpenOrganizersModal] = useState(false);
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);
    const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
    const [contractDocumentsModalOpen, setContractDocumentsModalOpen] = useState(false);
    const [contractConfirmOpen, setContractConfirmOpen] = useState(false);
    const [selectedContractDocumentIds, setSelectedContractDocumentIds] = useState<number[]>([]);
    const [contractSelectionLoading, setContractSelectionLoading] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectReasonError, setRejectReasonError] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelReasonError, setCancelReasonError] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    if (!selectedEvent) {
        return <div className="flex h-full items-center justify-center">Nincs kiválasztott esemény</div>;
    }

    const handleSave = async () => {
        if (isLockedEventStatus(selectedEvent.status)) {
            setIsEditing(false);
            return;
        }

        setIsEditing(false);
        await saveEvent(selectedEvent);
        await getEvent(selectedEvent.id);
    };

    const handleCancel = async () => {
        setIsEditing(false);
        await getEvent(selectedEvent.id);
    };

    const toggleSection = (index: number) => {
        setOpenSections((prevOpenSections) =>
            prevOpenSections.includes(index) ? prevOpenSections.filter((i) => i !== index) : [...prevOpenSections, index]
        );
    };

    const addOrganizer = async (userId: number) => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        const organizersArray = selectedEvent.assigned_user.flatMap((user) => user.id);
        organizersArray.push(userId);
        await addOrganizerToEvent(organizersArray, selectedEvent.id);
        await getEvent(selectedEvent.id);
    };

    const removeOrganizer = async (userId: number) => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        const organizersArray = selectedEvent.assigned_user.flatMap((user) => user.id);
        const removedArray = organizersArray.filter((id) => id !== userId);
        await addOrganizerToEvent(removedArray, selectedEvent.id);
        await getEvent(selectedEvent.id);
    };

    const handleQualificationChange = async (value: boolean) => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        await changeQualification(selectedEvent.id, value);
        await getEvent(selectedEvent.id);
    };

    const handleNextStatus = async () => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        if (selectedEvent.status === "Beérkezett") {
            const success = await statusChange("accept-event", selectedEvent.id);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Esemény sikeresen elfogadva.");
        } else if (selectedEvent.status === "UF Árajánlat elfogadásra vár") {
            const success = await statusChange("famulus/accept-offer", selectedEvent.id);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Árajánlat sikeresen elfogadva.");
        } else if (LEGAL_STATUS_ACTIONS[selectedEvent.status]) {
            const legalAction = LEGAL_STATUS_ACTIONS[selectedEvent.status];
            const success = await statusChange(legalAction.route, selectedEvent.id);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess(legalAction.successMessage);
        }

        revalidator.revalidate();
    };

    const reviewOfferType: OfferType | null =
        selectedEvent.status === "UF Árajánlat elfogadásra vár"
            ? "famulus"
            : selectedEvent.status === "Árajánlat elfogadásra vár"
              ? "uni"
              : null;

    const handleOpenOfferVersions = async () => {
        if (isLockedEventStatus(selectedEvent.status)) return;
        if (!reviewOfferType) return;

        const fetchedVersions = await getOfferVersions(selectedEvent.id, reviewOfferType);
        if (fetchedVersions !== false) {
            setVersionsModalOpen(true);
        }
    };

    const handleContractSelectionSubmit = (documentIds: number[]) => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        setSelectedContractDocumentIds(documentIds);
        setContractDocumentsModalOpen(false);
        setContractConfirmOpen(true);
    };

    const handleConfirmContractSelection = async () => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        setContractSelectionLoading(true);
        try {
            const success = await selectContractDocuments(selectedEvent.id, selectedContractDocumentIds);
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("A szerződések sikeresen kiválasztásra kerültek.");
            setContractConfirmOpen(false);
            setSelectedContractDocumentIds([]);
        } finally {
            setContractSelectionLoading(false);
            revalidator.revalidate();
        }
    };

    const handleRejectEvent = async () => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        if (rejectReason.trim().length === 0) {
            setRejectReasonError(true);
            return;
        }

        setRejectLoading(true);
        try {
            const success = await statusChange("reject-event", selectedEvent.id, rejectReason.trim());
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Rendezvény sikeresen elutasítva.");
            setRejectModalOpen(false);
            setRejectReason("");
            setRejectReasonError(false);
            navigate("/events", { replace: true });
        } finally {
            setRejectLoading(false);
        }
    };

    const handleCancelEvent = async () => {
        if (isLockedEventStatus(selectedEvent.status)) return;

        if (cancelReason.trim().length === 0) {
            setCancelReasonError(true);
            return;
        }

        setCancelLoading(true);
        try {
            const success = await statusChange("resigned-event", selectedEvent.id, cancelReason.trim());
            if (!success) {
                showActionError();
                return;
            }

            showActionSuccess("Rendezvény sikeresen lemondva.");
            setCancelModalOpen(false);
            setCancelReason("");
            setCancelReasonError(false);
            navigate("/events", { replace: true });
        } finally {
            setCancelLoading(false);
        }
    };

    const legalStatusAction = LEGAL_STATUS_ACTIONS[selectedEvent.status] ?? null;
    const isEventLocked = isLockedEventStatus(selectedEvent.status);
    const isEditingAllowed = isEditing && !isEventLocked;
    const canManageEvent = Number(user.role) === ROLES.ADMIN || Number(user.role) === ROLES.ORGANIZER;
    const canRejectEvent = !isEventLocked && canManageEvent && selectedEvent.status === "Beérkezett";
    const canCancelEvent = !isEventLocked && canManageEvent;
    const primaryActionClassName =
        "bg-primary-light flex h-10 cursor-pointer flex-row items-center justify-center gap-1 rounded-md px-4 py-2 text-sm whitespace-nowrap text-white max-sm:w-full";

    const openRejectModal = () => {
        setRejectReason("");
        setRejectReasonError(false);
        setRejectModalOpen(true);
    };

    const openCancelModal = () => {
        setCancelReason("");
        setCancelReasonError(false);
        setCancelModalOpen(true);
    };

    const startEditing = () => {
        if (isEventLocked) return;

        setIsEditing(true);
        dispatch(SetSidebarOpen(false));
    };

    const moreActionItems: NonNullable<MenuProps["items"]> = [
        {
            key: "edit",
            icon: <Pencil size={16} />,
            label: "Szerkesztés",
        },
        {
            key: "documents",
            icon: <FileText size={16} />,
            label: "Dokumentumok",
        },
    ];

    if (canRejectEvent) {
        moreActionItems.push({
            key: "reject",
            danger: true,
            icon: <Ban size={16} />,
            label: "Elutasítás",
        });
    }

    if (canCancelEvent) {
        moreActionItems.push({
            key: "cancel",
            danger: true,
            icon: <X size={16} />,
            label: "Lemondás",
        });
    }

    const handleMoreActionClick: MenuProps["onClick"] = ({ key }) => {
        if (key === "edit") {
            startEditing();
            return;
        }

        if (key === "documents") {
            setDocumentsModalOpen(true);
            return;
        }

        if (key === "reject") {
            openRejectModal();
            return;
        }

        if (key === "cancel") {
            openCancelModal();
        }
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <ConfirmModal
                open={contractConfirmOpen}
                title="Szerződések kiválasztása"
                message={
                    <>
                        <p className="font-medium">Biztosan kiválasztja a megjelölt dokumentumokat?</p>
                        <p className="mt-1 text-[#3e484c]/70">{selectedContractDocumentIds.length} dokumentum kerül elküldésre.</p>
                    </>
                }
                confirmText="Kiválasztás"
                onCancel={() => setContractConfirmOpen(false)}
                onConfirm={handleConfirmContractSelection}
                confirmLoading={contractSelectionLoading}
                confirmDisabled={selectedContractDocumentIds.length === 0}
            />
            <DownloadableDocumentsModal eventId={selectedEvent.id} open={documentsModalOpen} onClose={() => setDocumentsModalOpen(false)} />
            <Modal
                title="Felelősök hozzáadása"
                open={openOrganizersModal && !isEventLocked}
                onCancel={() => setOpenOrganizersModal(false)}
                cancelButtonProps={{ style: { display: "none" } }}
                okText="Mentés"
                onOk={() => setOpenOrganizersModal(false)}
                footer={null}
            >
                <div className="flex max-h-[70vh] w-full flex-col gap-4 overflow-y-auto">
                    <div className="flex w-full flex-row items-center justify-between">
                        <p className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Jelenlegi felelősök</p>
                        <div className="text-primary-light bg-primary-light/10 rounded-full px-2 font-medium">
                            {selectedEvent.assigned_user?.length} Aktív
                        </div>
                    </div>
                    <div className="flex w-full flex-col gap-4">
                        {selectedEvent.assigned_user.length > 0 ? (
                            selectedEvent.assigned_user.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex w-full flex-row items-center justify-between rounded-lg bg-[#f1f4f6] px-4 py-2"
                                >
                                    <div className="flex flex-row items-center gap-4">
                                        <img
                                            src={user.picture}
                                            alt={user.displayName}
                                            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{user.displayName}</p>
                                            <p>{user.roleName}</p>
                                        </div>
                                    </div>
                                    <button className="cursor-pointer" onClick={() => removeOrganizer(user.id)}>
                                        <UserRoundMinus color="#ba1b1b" size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center">Jelenleg nincs felelős az eseményhez rendelve!</div>
                        )}
                    </div>
                    <div className="mt-4 flex w-full flex-row items-center justify-between">
                        <p className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Új felelős keresése</p>
                    </div>
                    <div className="relative inline-block w-full">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#bdc3c5]">
                            <Search size={20} />
                        </div>

                        <input
                            type="search"
                            name="organizersSearch"
                            id="organizersSearchId"
                            className="w-full rounded-lg bg-[#ebeef0] py-2 pr-4 pl-10 outline-none placeholder:text-[#bdc3c5]"
                            placeholder="Név..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full flex-col gap-4">
                        {users
                            .filter((user) => user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
                            .filter((user) => !selectedEvent.assigned_user.some((assigned) => assigned.id === user.id))
                            .map((user) => (
                                <div
                                    key={user.id}
                                    className="flex w-full flex-row items-center justify-between rounded-lg bg-[#f1f4f6] px-4 py-2"
                                >
                                    <div className="flex flex-row items-center gap-4">
                                        <img
                                            src={user.picture}
                                            alt={user.displayName}
                                            className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <p className="font-semibold">{user.displayName}</p>
                                            <p>{user.roleName}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="text-primary-light hover:bg-primary-light border-primary-light flex cursor-pointer flex-row items-center gap-2 rounded-xl border p-2 transition-all hover:text-white"
                                        onClick={() => addOrganizer(user.id)}
                                    >
                                        <UserRoundPlus fill="#50adc9" className="hover:text-white" size={18} />
                                        Hozzáad
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </Modal>

            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h1 className="w-full text-2xl font-bold break-words">{selectedEvent.name}</h1>
                    <p className="text-sm">Esemény státusza</p>
                </div>
                <div className="flex w-full shrink-0 flex-row items-center justify-end gap-2 self-stretch max-sm:flex-col max-sm:items-stretch md:w-auto md:self-auto">
                    {isEditingAllowed && (
                        <div className="bg-primary-light relative flex w-fit cursor-pointer items-center rounded-md p-1 select-none">
                            <div
                                className={`absolute top-1 bottom-1 z-10 w-[calc(50%-4px)] rounded-md bg-white transition-transform duration-300 ease-in-out ${
                                    selectedEvent.qualification ? "translate-x-0" : "translate-x-full"
                                }`}
                            ></div>

                            <button
                                type="button"
                                className={`relative z-20 flex-1 cursor-pointer px-4 py-1.5 text-center text-sm font-medium transition-colors duration-300 ${
                                    selectedEvent.qualification ? "text-primary-light" : "text-white hover:text-white/80"
                                }`}
                                onClick={() => handleQualificationChange(true)}
                            >
                                Belsős
                            </button>
                            <button
                                type="button"
                                className={`relative z-20 flex-1 cursor-pointer px-4 py-1.5 text-center text-sm font-medium transition-colors duration-300 ${
                                    !selectedEvent.qualification ? "text-primary-light" : "text-white hover:text-white/80"
                                }`}
                                onClick={() => handleQualificationChange(false)}
                            >
                                Külsős
                            </button>
                        </div>
                    )}
                    {isEditingAllowed && (
                        <button className={primaryActionClassName} onClick={handleCancel}>
                            <X /> Mégse
                        </button>
                    )}
                    {!isEventLocked && !isEditingAllowed && selectedEvent.status === "Árajánlat készítésre vár" && (
                        <Link to={`/assign-uni-price/${selectedEvent.id}`} className={primaryActionClassName}>
                            <DollarSign /> Árajánlat adása
                        </Link>
                    )}
                    {!isEventLocked && !isEditingAllowed && reviewOfferType && (
                        <button className={primaryActionClassName} onClick={handleOpenOfferVersions}>
                            <Eye /> Árajánlat megtekintése
                        </button>
                    )}
                    {!isEventLocked && !isEditingAllowed && selectedEvent.status === "Szerződéses adatokra vár" && (
                        <button className={primaryActionClassName} onClick={() => setContractDocumentsModalOpen(true)}>
                            <FileText /> Szerződések kiválasztása
                        </button>
                    )}
                    {!isEventLocked && !isEditingAllowed && selectedEvent.status === "Beérkezett" && (
                        <button className={primaryActionClassName} onClick={handleNextStatus}>
                            <Check /> Elfogadás
                        </button>
                    )}
                    {!isEventLocked && !isEditingAllowed && legalStatusAction && (
                        <button className={primaryActionClassName} onClick={handleNextStatus}>
                            <FileText /> {legalStatusAction.buttonLabel}
                        </button>
                    )}
                    {isEditingAllowed ? (
                        <button className={primaryActionClassName} onClick={handleSave}>
                            <Save /> Mentés
                        </button>
                    ) : !isEventLocked ? (
                        <Dropdown
                            menu={{ items: moreActionItems, onClick: handleMoreActionClick }}
                            trigger={["click"]}
                            placement="bottomRight"
                        >
                            <button
                                type="button"
                                className="border-primary-light text-primary-light flex h-10 cursor-pointer flex-row items-center justify-center gap-1 rounded-md border bg-white px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-[#f1f9fb] max-sm:w-full"
                            >
                                <MoreHorizontal size={18} />
                                Műveletek
                            </button>
                        </Dropdown>
                    ) : null}
                </div>
            </div>

            <main className="flex flex-1 flex-col-reverse gap-4 lg:flex-row">
                <div className="flex w-full flex-col gap-4 lg:w-[70%]">
                    {eventSections.map((section, index) => {
                        const isOpen = openSections.includes(index);
                        return (
                            <div key={index} className="flex flex-col rounded-md bg-white p-4">
                                <div className="group flex cursor-pointer flex-row justify-between" onClick={() => toggleSection(index)}>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="bg-primary-light h-full w-1.5 rounded-full" />
                                        <h2 className="group-hover:text-dark/80 text-xl font-semibold transition-colors">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <ChevronDown
                                        className={`transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`}
                                        color="#50adc9"
                                    />
                                </div>
                                <div
                                    className={`grid grid-cols-2 items-center gap-x-4 gap-y-2 overflow-hidden transition-all duration-500 min-[700px]:grid-cols-[max-content_1fr] ${
                                        isOpen ? "mt-4 max-h-[5000px]" : "max-h-0"
                                    }`}
                                >
                                    {section.config.map((config) =>
                                        config.condition && !config.condition(selectedEvent) ? null : (
                                            <DetailRow
                                                key={config.fieldKey}
                                                label={config.label}
                                                value={selectedEvent[config.fieldKey]}
                                                type={config.type}
                                                isEditing={isEditingAllowed}
                                                onChange={(val) => dispatch(EditSelectedEvent({ field: config.fieldKey, value: val }))}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex w-full flex-col gap-4 min-[800px]:flex-row lg:w-[30%] lg:flex-col">
                    <div className="flex w-full flex-col gap-8 rounded-md bg-white p-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Esemény állapota</h3>
                            <div className="text-primary-light bg-primary-light/10 w-fit rounded-lg px-2 py-2 font-semibold">
                                {selectedEvent.status}
                            </div>
                        </div>
                        <StatusHistory selectedEvent={selectedEvent} />
                    </div>
                    <div className="flex w-full flex-col gap-8 rounded-md bg-white p-4">
                        <div className="flex w-full flex-row items-center justify-between">
                            <h3 className="text-[14px] font-semibold tracking-wide text-[#3e484c] uppercase">Felelősök</h3>
                            {!isEventLocked && (
                                <button className="cursor-pointer" onClick={() => setOpenOrganizersModal(!openOrganizersModal)}>
                                    <UserRoundPlus color="#50adc9" />
                                </button>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-4">
                            {selectedEvent.assigned_user.length > 0 ? (
                                selectedEvent.assigned_user.map((user) => (
                                    <div key={user.id} className="flex w-full flex-row items-center justify-between rounded-lg">
                                        <div className="flex flex-row items-center gap-4">
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                                            />
                                            <div className="flex flex-col">
                                                <p className="font-semibold">{user.name}</p>
                                                <p>{user.roleName}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center text-[14px]">Nincs felelős!</div>
                            )}
                        </div>
                    </div>
                    <ChatHistory eventData={selectedEvent} mode="organizer" readOnly={isEventLocked} />
                </div>
            </main>

            <AssignDocumentsModal
                open={false}
                onClose={() => setIsEditing(false)}
                onSuccess={() => {
                    setIsEditing(false);
                }}
            />
            <SelectContractDocumentsModal
                open={contractDocumentsModalOpen}
                onClose={() => setContractDocumentsModalOpen(false)}
                onSubmit={handleContractSelectionSubmit}
            />
            <OfferVersionsModal
                open={versionsModalOpen}
                onClose={() => setVersionsModalOpen(false)}
                versions={versions}
                currentVersionId={versions.find((version) => version.current)?.id ?? null}
                onSelectVersion={(versionId) => reviewOfferType && navigate(`/offers/${selectedEvent.id}/${reviewOfferType}/${versionId}`)}
            />
            <Modal
                title="Rendezvény elutasítása"
                open={rejectModalOpen}
                onCancel={rejectLoading ? undefined : () => setRejectModalOpen(false)}
                width={480}
                footer={
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setRejectModalOpen(false)}
                            disabled={rejectLoading}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleRejectEvent}
                            disabled={rejectLoading}
                            className="flex h-fit cursor-pointer flex-row gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-500/80 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {rejectLoading ? "Mentés..." : "Elutasítás"}
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
                        placeholder="Adja meg, miért utasítja el a rendezvényt..."
                        className={`w-full resize-none rounded-md border bg-gray-50/60 px-3 py-2 text-sm text-[#3e484c] placeholder:text-[#3e484c]/30 focus:ring-2 focus:outline-none ${
                            rejectReasonError ? "border-red-300 focus:ring-red-300/40" : "focus:ring-primary-light/40 border-[#3e484c]/10"
                        }`}
                    />
                    {rejectReasonError && <p className="text-[11px] text-red-500">Az indoklás megadása kötelező.</p>}
                </div>
            </Modal>
            <Modal
                title="Rendezvény lemondása"
                open={cancelModalOpen}
                onCancel={cancelLoading ? undefined : () => setCancelModalOpen(false)}
                width={480}
                footer={
                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            onClick={() => setCancelModalOpen(false)}
                            disabled={cancelLoading}
                            className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Mégse
                        </button>
                        <button
                            onClick={handleCancelEvent}
                            disabled={cancelLoading}
                            className="flex h-fit cursor-pointer flex-row gap-1 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-500/80 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {cancelLoading ? "Mentés..." : "Lemondás"}
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col gap-1.5 py-2">
                    <label className="text-[10px] font-semibold tracking-wide text-[#3e484c]/50 uppercase">Lemondás indoka</label>
                    <textarea
                        rows={4}
                        value={cancelReason}
                        onChange={(e) => {
                            setCancelReason(e.target.value);
                            if (e.target.value.trim().length > 0) setCancelReasonError(false);
                        }}
                        placeholder="Adja meg, miért mondja le a rendezvényt..."
                        className={`w-full resize-none rounded-md border bg-gray-50/60 px-3 py-2 text-sm text-[#3e484c] placeholder:text-[#3e484c]/30 focus:ring-2 focus:outline-none ${
                            cancelReasonError ? "border-red-300 focus:ring-red-300/40" : "focus:ring-primary-light/40 border-[#3e484c]/10"
                        }`}
                    />
                    {cancelReasonError && <p className="text-[11px] text-red-500">Az indoklás megadása kötelező.</p>}
                </div>
            </Modal>
        </div>
    );
};

export default DatasheetPage;
