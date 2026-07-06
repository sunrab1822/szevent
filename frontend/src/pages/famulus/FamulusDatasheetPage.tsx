import { ChevronDown, DollarSign, Eye, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getEvent } from "../../actions/getEvent";
import { getOfferVersions } from "../../actions/getOfferVersions";
import { statusChange } from "../../actions/statusChange";
import ChatHistory from "../../components/ChatHistory";
import DetailRow from "../../components/DetailRow";
import OfferVersionsModal from "../../components/OfferVersionsModal";
import { eventSections } from "../../entitys/datasheetConfig";
import { EditSelectedEvent } from "../../redux/action/events/editSelectedEvent";
import { useSelector } from "../../redux/store";
import StatusHistory from "../../components/StatusHistory";
import { showActionError, showActionSuccess } from "../../utils/actionFeedback";

const FamulusDatasheetPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedEvent } = useSelector((state) => state.event);
    const { versions, eventId: offerEventId, offerType } = useSelector((state) => state.offer);
    const [isEditing] = useState(false);
    const [openSections, setOpenSections] = useState<number[]>([0]);
    const [versionsModalOpen, setVersionsModalOpen] = useState(false);

    useEffect(() => {
        if (!selectedEvent) return;
        void getOfferVersions(selectedEvent.id, "famulus");
    }, [selectedEvent]);

    if (!selectedEvent) {
        return <div className="flex h-full items-center justify-center">Nincs kiválasztott esemény</div>;
    }

    const toggleSection = (index: number) => {
        setOpenSections((prevOpenSections) =>
            prevOpenSections.includes(index) ? prevOpenSections.filter((i) => i !== index) : [...prevOpenSections, index]
        );
    };

    const hasFamulusOfferVersions = offerEventId === selectedEvent.id && offerType === "famulus" && versions.length > 0;

    const handleOpenOfferVersions = async () => {
        const fetchedVersions = await getOfferVersions(selectedEvent.id, "famulus");
        if (fetchedVersions !== false && fetchedVersions.length > 0) {
            setVersionsModalOpen(true);
        }
    };

    const handleLegalTigAccept = async () => {
        const success = await statusChange("legal/TIG", selectedEvent.id);
        if (!success) {
            showActionError();
            return;
        }

        showActionSuccess("Státusz sikeresen frissítve.");
        await getEvent(selectedEvent.id);
    };

    return (
        <div className="flex w-full flex-col gap-6">
            <OfferVersionsModal
                open={versionsModalOpen}
                onClose={() => setVersionsModalOpen(false)}
                versions={versions}
                currentVersionId={versions.find((version) => version.current)?.id ?? null}
                onSelectVersion={(versionId) => navigate(`/offers/${selectedEvent.id}/famulus/${versionId}`)}
            />

            <div className="min-tablet:flex-row min-tablet:items-center max-tablet:flex-wrap flex flex-col items-start justify-between gap-2">
                <div className="flex flex-1 flex-col gap-1">
                    <h1 className="flex-1 text-2xl font-bold" dangerouslySetInnerHTML={{ __html: selectedEvent.name }}></h1>
                    <p className="text-sm">Esemény státusza</p>
                </div>
                <div className="flex w-full max-w-[608px] flex-row justify-end gap-2 max-lg:place-self-end max-sm:flex-wrap">
                    {selectedEvent.status === "UF Árajánlatra vár" && (
                        <Link
                            to={`/assign-price/${selectedEvent.id}`}
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                        >
                            <DollarSign />
                            Árajánlat adása
                        </Link>
                    )}
                    {hasFamulusOfferVersions && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={handleOpenOfferVersions}
                        >
                            <Eye />
                            Árajánlat megtekintése
                        </button>
                    )}
                    {selectedEvent.status === "Megvalósult - UF igazolásra vár" && (
                        <button
                            className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white"
                            onClick={handleLegalTigAccept}
                        >
                            <FileText />
                            UF Igazolás elfogadva
                        </button>
                    )}
                    {/* <button className="bg-primary-light flex cursor-pointer flex-row gap-1 rounded-md px-4 py-2 text-white">
                        <FileText />
                        PDF generálása
                    </button> */}
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
        </div>
    );
};

export default FamulusDatasheetPage;
