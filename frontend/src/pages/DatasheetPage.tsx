import { ChevronDown, DollarSign, Eye, FileText, Pencil, Save, Search, UserRoundMinus, UserRoundPlus, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "antd";
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
import OfferVersionsModal from "../components/OfferVersionsModal";
import SelectContractDocumentsModal from "../components/SelectContractDocumentsModal";
import type { OfferType } from "../entitys/Offer";
import { eventSections } from "../entitys/datasheetConfig";
import { EditSelectedEvent } from "../redux/action/events/editSelectedEvent";
import { SetSidebarOpen } from "../redux/action/globalProps/setSidebarOpen";
import { useSelector } from "../redux/store";
import { showActionError, showActionSuccess } from "../utils/actionFeedback";
import StatusHistory from "../components/StatusHistory";
import { downloadAuthorizationDocument } from "../actions/downloadAuthorizationDocument";

const LEGAL_STATUS_ACTIONS: Record<string, { buttonLabel: string; route: string; successMessage: string }> = {
    "Partneri aláírásra vár": {
        buttonLabel: "Ügyfél által elfogadva",
        route: "legal/accept-client",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Egyetemi aláírásra vár": {
        buttonLabel: "Egyetem által elfogadva",
        route: "legal/accept-uni",
        successMessage: "Státusz sikeresen frissítve.",
    },
    "Szerződés kiküldésre vár": {
        buttonLabel: "Szerződés aláírva",
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
    const { selectedEvent } = useSelector((state) => state.event);
    const { users } = useSelector((state) => state.users);
    const { versions } = useSelector((state) => state.offer);
    const [isEditing, setIsEditing] = useState(false);
    const [openSections, setOpenSections] = useState<number[]>([0]);
    const [openOrganizersModal, setOpenOrganizersModal] = useState(false);
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);
    const [contractDocumentsModalOpen, setContractDocumentsModalOpen] = useState(false);
    const [contractConfirmOpen, setContractConfirmOpen] = useState(false);
    const [selectedContractDocumentIds, setSelectedContractDocumentIds] = useState<number[]>([]);
    const [contractSelectionLoading, setContractSelectionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    if (!selectedEvent) {
        return <div className="flex h-full items-center justify-center">Nincs kiválasztott esemény</div>;
    }

    const handleSave = async () => {
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
        const organizersArray = selectedEvent.assigned_user.flatMap((user) => user.id);
        organizersArray.push(userId);
        await addOrganizerToEvent(organizersArray, selectedEvent.id);
        await getEvent(selectedEvent.id);
    };

    const removeOrganizer = async (userId: number) => {
        const organizersArray = selectedEvent.assigned_user.flatMap((user) => user.id);
        const removedArray = organizersArray.filter((id) => id !== userId);
        await addOrganizerToEvent(removedArray, selectedEvent.id);
        await getEvent(selectedEvent.id);
    };

    const handleQualificationChange = async (value: boolean) => {
        await changeQualification(selectedEvent.id, value);
        await getEvent(selectedEvent.id);
    };

    const handleNextStatus = async () => {
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
        if (!reviewOfferType) return;

        const fetchedVersions = await getOfferVersions(selectedEvent.id, reviewOfferType);
        if (fetchedVersions !== false) {
            setVersionsModalOpen(true);
        }
    };

    const handleContractSelectionSubmit = (documentIds: number[]) => {
        setSelectedContractDocumentIds(documentIds);
        setContractDocumentsModalOpen(false);
        setContractConfirmOpen(true);
    };

    const handleConfirmContractSelection = async () => {
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

    const legalStatusAction = LEGAL_STATUS_ACTIONS[selectedEvent.status] ?? null;

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
            <Modal
                title="Felelősök hozzáadása"
                open={openOrganizersModal}
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

            <div className="min-tablet:flex-row min-tablet:items-center max-tablet:flex-wrap flex flex-col items-start justify-between gap-2">
                <div className="flex flex-1 flex-col gap-1">
                    <h1 className="flex-1 text-2xl font-bold" dangerouslySetInnerHTML={{ __html: selectedEvent.name }}></h1>
                    <p className="text-sm">Esemény státusza</p>
                </div>
                <div className="flex w-full max-w-[608px] flex-row justify-end gap-2 max-lg:place-self-end max-sm:flex-wrap">
                    {isEditing && (
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
                    {isEditing && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={handleCancel}
                        >
                            <X /> Mégse
                        </button>
                    )}
                    {!isEditing && selectedEvent.status === "Árajánlat készítésre vár" && (
                        <Link
                            to={`/assign-uni-price/${selectedEvent.id}`}
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                        >
                            <DollarSign /> Árajánlat adása
                        </Link>
                    )}
                    {!isEditing && reviewOfferType && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={handleOpenOfferVersions}
                        >
                            <Eye /> Árajánlat megtekintése
                        </button>
                    )}
                    {!isEditing && selectedEvent.status === "Szerződéses adatokra vár" && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={() => setContractDocumentsModalOpen(true)}
                        >
                            <FileText /> Szerződések kiválasztása
                        </button>
                    )}
                    {!isEditing && legalStatusAction && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={handleNextStatus}
                        >
                            <FileText /> {legalStatusAction.buttonLabel}
                        </button>
                    )}
                    <button
                        className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                        onClick={
                            isEditing
                                ? handleSave
                                : () => {
                                      setIsEditing(!isEditing);
                                      dispatch(SetSidebarOpen(false));
                                  }
                        }
                    >
                        {isEditing ? <Save /> : <Pencil />}
                        {isEditing ? "Mentés" : "Szerkesztés"}
                    </button>
                    <button
                        onClick={() => downloadAuthorizationDocument(selectedEvent.id, "Rendezvény engedélyeztető")}
                        className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                    >
                        <FileText />
                        PDF generálása
                    </button>
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
                                        <h2
                                            className="group-hover:text-dark/80 text-xl font-semibold transition-colors"
                                            dangerouslySetInnerHTML={{ __html: section.title }}
                                        />
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
                                                isEditing={isEditing}
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
                            <button className="cursor-pointer" onClick={() => setOpenOrganizersModal(!openOrganizersModal)}>
                                <UserRoundPlus color="#50adc9" />
                            </button>
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
                    <ChatHistory eventData={selectedEvent} />
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
        </div>
    );
};

export default DatasheetPage;
