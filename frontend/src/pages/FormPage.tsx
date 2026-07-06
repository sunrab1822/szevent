import React, { useEffect, useRef, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Check, ArrowLeft, ArrowRight, Save, Send, Loader2, UploadCloud, X, Upload } from "lucide-react";
import { sendEventForm } from "../actions/sendEventForm";

const formSchema = z
    .object({
        // Step 0 – Event basics
        name: z.string().min(1, "Kötelező mező"),
        description: z.string().min(1, "Kötelező mező"),
        location: z.string().min(1, "Kötelező mező"),
        address: z.string().min(1, "Kötelező mező"),
        startDate: z.string().min(1, "Kötelező mező"),
        endDate: z.string().min(1, "Kötelező mező"),
        type: z.string().min(1, "Kötelező mező"),
        qualification: z.string().min(1, "Kötelező mező"),
        participants: z.number().min(1, "Min. 1 fő"),
        public: z.boolean(),

        // Step 1 –  details
        nature: z.string().min(1, "Kötelező mező"),
        detailedProgramPlan: z.string().min(1, "Kötelező mező"),
        furnishedMethod: z.string().min(1, "Kötelező mező"),
        needAccommodation: z.boolean(),
        needAccommodationNumber: z.preprocess((v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v), z.number().optional()),
        needParkingSpace: z.boolean(),
        needParkingSpaceNumber: z.preprocess((v) => (v === "" || v === null || Number.isNaN(v) ? undefined : v), z.number().optional()),
        producesTrash: z.boolean(),
        producesTrashDelivery: z.string().optional(),
        producesTrashDeliveryWhoDelivers: z.string().optional(),
        needWifi: z.boolean(),
        needEducationalTechnology: z.boolean(),
        needEducationalTechnologyItems: z.string().optional(),
        participantsWithReducedMobility: z.boolean(),
        willBePhotos: z.boolean(),
        willBePhotosDevice: z.string().optional(),
        needCatering: z.boolean(),
        needCateringType: z.array(z.string()).optional(),
        willBeConstruction: z.boolean(),
        constructionStartDate: z.string().optional(),
        constructionEndDate: z.string().optional(),
        constructionSubcontractors: z.string().optional(),
        constructionInHeights: z.boolean(),
        constructionNeedScaffolding: z.boolean(),
        constructionManualMaterialHandling: z.boolean(),
        constructionMechanicalMaterialHandling: z.boolean(),
        constructionMechanicalMaschines: z.array(z.string()).optional(),
        constructionMechanicalMaschinesOthers: z.string().optional(),
        needCleaningBefore: z.boolean(),
        needCleaningDuringEvent: z.boolean(),
        needElectricians: z.array(z.string()).optional(),
        needElectricityFromCabinet: z.boolean(),
        needElectricityFromCabinetNumber: z.string().optional(),
        fireHazardExpected: z.boolean(),
        fireHazardExpectedDescription: z.string().optional(),
        expectedDustSmokeVapor: z.array(z.string()).optional(),
        expectedUsageOfChemicals: z.boolean(),
        expectedUsageOfChemicalsDescription: z.string().optional(),
        expectedDecor: z.boolean(),

        // Step 2 – Organizer
        organizerFullName: z.string().min(1, "Kötelező mező"),
        organizerPhone: z.string().min(1, "Kötelező mező"),
        organizerEmail: z.string().email("Érvénytelen e-mail cím"),
        organizerAddress: z.string().min(1, "Kötelező mező"),
        moreOrganizer: z.boolean(),
        secondOrganizerFullName: z.string().optional(),
        secondOrganizerPhone: z.string().optional(),
        secondOrganizerEmail: z.string().optional(),
        secondOrganizerAddress: z.string().optional(),

        // Step 3 – Legal background (all optional)
        customerWithLegalBackgroundName: z.string().optional(),
        customerWithLegalBackgroundAddress: z.string().optional(),
        customerWithLegalBackgroundTaxNumber: z.string().optional(),
        registrationNumber: z.string().optional(),
        Representative: z.string().optional(),
        RepresentativeTitle: z.string().optional(),
        customerWithLegalBackgroundPhone: z.string().optional(),
        customerWithLegalBackgroundEmail: z.string().optional(),
    })
    .superRefine((d, ctx) => {
        const req = (cond: boolean, path: string) => {
            if (cond) ctx.addIssue({ code: "custom", path: [path], message: "Kötelező mező" });
        };
        req(d.needAccommodation && !d.needAccommodationNumber, "needAccommodationNumber");
        req(d.needParkingSpace && !d.needParkingSpaceNumber, "needParkingSpaceNumber");
        req(d.producesTrash && !d.producesTrashDelivery, "producesTrashDelivery");
        req(d.producesTrashDelivery === "Saját úton" && !d.producesTrashDeliveryWhoDelivers, "producesTrashDeliveryWhoDelivers");
        req(d.needEducationalTechnology && !d.needEducationalTechnologyItems, "needEducationalTechnologyItems");
        req(d.willBePhotos && !d.willBePhotosDevice, "willBePhotosDevice");
        if (d.needCatering && (!d.needCateringType || d.needCateringType.length === 0))
            ctx.addIssue({ code: "custom", path: ["needCateringType"], message: "Legalább egy típus szükséges" });
        if (d.willBeConstruction) {
            req(!d.constructionStartDate, "constructionStartDate");
            req(!d.constructionEndDate, "constructionEndDate");
            req(!d.constructionSubcontractors, "constructionSubcontractors");
        }
        req(d.needElectricityFromCabinet && !d.needElectricityFromCabinetNumber, "needElectricityFromCabinetNumber");
        req(d.fireHazardExpected && !d.fireHazardExpectedDescription, "fireHazardExpectedDescription");
        req(d.expectedUsageOfChemicals && !d.expectedUsageOfChemicalsDescription, "expectedUsageOfChemicalsDescription");
        if (d.moreOrganizer) {
            req(!d.secondOrganizerFullName, "secondOrganizerFullName");
            req(!d.secondOrganizerPhone, "secondOrganizerPhone");
            req(!d.secondOrganizerEmail, "secondOrganizerEmail");
            req(!d.secondOrganizerAddress, "secondOrganizerAddress");
        }
    });

export type EventFormValues = z.output<typeof formSchema>;
type EventFormInputValues = z.input<typeof formSchema>;

const STAGES = ["Rendezvény adatai", "Részletes adatok", "Felelős személy", "Megrendelő", "Fájl feltöltés"];

const STEP_FIELDS: (keyof EventFormValues)[][] = [
    ["name", "description", "location", "address", "startDate", "endDate", "type", "qualification", "participants", "public"],
    [
        "nature",
        "detailedProgramPlan",
        "needAccommodation",
        "needParkingSpace",
        "producesTrash",
        "needWifi",
        "needEducationalTechnology",
        "participantsWithReducedMobility",
        "willBePhotos",
        "needCatering",
        "willBeConstruction",
        "needCleaningBefore",
        "needCleaningDuringEvent",
        "needElectricityFromCabinet",
        "fireHazardExpected",
        "expectedUsageOfChemicals",
        "expectedDecor",
        "needElectricians",
        "expectedDustSmokeVapor",
    ],
    ["organizerFullName", "organizerPhone", "organizerEmail", "organizerAddress", "moreOrganizer"],
    [
        "customerWithLegalBackgroundName",
        "customerWithLegalBackgroundAddress",
        "customerWithLegalBackgroundTaxNumber",
        "registrationNumber",
        "Representative",
        "RepresentativeTitle",
        "customerWithLegalBackgroundPhone",
        "customerWithLegalBackgroundEmail",
    ],
    [],
];

const DEFAULT_VALUES: EventFormValues = {
    name: "",
    description: "",
    location: "",
    address: "9026 Győr, Egyetem tér 1.",
    startDate: "",
    endDate: "",
    type: "",
    qualification: "",
    participants: 0,
    public: false,
    nature: "",
    detailedProgramPlan: "",
    furnishedMethod: "",
    needAccommodation: false,
    needAccommodationNumber: undefined,
    needParkingSpace: false,
    needParkingSpaceNumber: undefined,
    producesTrash: false,
    producesTrashDelivery: "",
    producesTrashDeliveryWhoDelivers: "",
    needWifi: false,
    needEducationalTechnology: false,
    needEducationalTechnologyItems: "",
    participantsWithReducedMobility: false,
    willBePhotos: false,
    willBePhotosDevice: "",
    needCatering: false,
    needCateringType: [],
    willBeConstruction: false,
    constructionStartDate: "",
    constructionEndDate: "",
    constructionSubcontractors: "",
    constructionInHeights: false,
    constructionNeedScaffolding: false,
    constructionManualMaterialHandling: false,
    constructionMechanicalMaterialHandling: false,
    constructionMechanicalMaschines: [],
    constructionMechanicalMaschinesOthers: "",
    needCleaningBefore: false,
    needCleaningDuringEvent: false,
    needElectricians: [],
    needElectricityFromCabinet: false,
    needElectricityFromCabinetNumber: "",
    fireHazardExpected: false,
    fireHazardExpectedDescription: "",
    expectedDustSmokeVapor: [],
    expectedUsageOfChemicals: false,
    expectedUsageOfChemicalsDescription: "",
    expectedDecor: false,
    organizerFullName: "",
    organizerPhone: "",
    organizerEmail: "",
    organizerAddress: "",
    moreOrganizer: false,
    secondOrganizerFullName: "",
    secondOrganizerPhone: "",
    secondOrganizerEmail: "",
    secondOrganizerAddress: "",
    customerWithLegalBackgroundName: "",
    customerWithLegalBackgroundAddress: "",
    customerWithLegalBackgroundTaxNumber: "",
    registrationNumber: "",
    Representative: "",
    RepresentativeTitle: "",
    customerWithLegalBackgroundPhone: "",
    customerWithLegalBackgroundEmail: "",
};

const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = ({
    label,
    required,
    error,
    children,
}) => (
    <div className="mb-4 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#3e484c]">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
);

const StyledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }>(
    ({ hasError, className = "", ...props }, ref) => (
        <input
            ref={ref}
            {...props}
            className={[
                "w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#3e484c] outline-none",
                "transition-colors duration-150 placeholder:text-[#bdc3c5]",
                "focus:border-[#50adc9] focus:ring-2 focus:ring-[#50adc9]/20",
                hasError ? "border-rose-400 focus:border-rose-400 focus:ring-rose-200" : "border-[#dde2e5]",
                className,
            ].join(" ")}
        />
    )
);
StyledInput.displayName = "StyledInput";

interface ToggleProps {
    value: boolean;
    onChange: (v: boolean) => void;
    interacted: boolean;
    onFirstInteract: () => void;
}
const Toggle: React.FC<ToggleProps> = ({ value, onChange, interacted, onFirstInteract }) => (
    <button
        type="button"
        onClick={() => {
            onFirstInteract();
            onChange(!value);
        }}
        role="switch"
        aria-checked={value}
        className={[
            "relative h-8 w-[78px] flex-shrink-0 cursor-pointer overflow-hidden rounded-full border select-none",
            "transition-colors duration-200",
            !interacted ? "border-[#dde2e5] bg-[#f1f4f6]" : value ? "border-[#50adc9] bg-[#50adc9]" : "border-[#dde2e5] bg-white",
        ].join(" ")}
    >
        {/* sliding pill */}
        <span
            className={[
                "absolute inset-0 flex items-center justify-center text-xs font-semibold",
                "transition-transform duration-200",
            ].join(" ")}
        >
            {!interacted ? (
                <span className="text-[11px] text-[#bdc3c5]">Kattints</span>
            ) : value ? (
                <span className="text-white">Igen</span>
            ) : (
                <span className="text-[#3e484c]">Nem</span>
            )}
        </span>
    </button>
);

interface ToggleRowProps {
    label: string;
    required?: boolean;
    value: boolean;
    onChange: (v: boolean) => void;
    interacted: boolean;
    onFirstInteract: () => void;
}
const ToggleRow: React.FC<ToggleRowProps> = ({ label, required, ...rest }) => (
    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-[#ebeef0] bg-white px-4 py-3">
        <span className="text-sm font-medium text-[#3e484c]">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
        </span>
        <Toggle {...rest} />
    </div>
);

interface DropdownProps {
    options: string[];
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hasError?: boolean;
}
const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder = "Válassz egy opciót", hasError }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className={[
                    "flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                    "transition-colors duration-150 focus:border-[#50adc9] focus:ring-2 focus:ring-[#50adc9]/20",
                    !value ? "text-[#bdc3c5]" : "text-[#3e484c]",
                    hasError ? "border-rose-400" : "border-[#dde2e5]",
                ].join(" ")}
            >
                <span>{value || placeholder}</span>
                <ChevronDown
                    size={15}
                    className={["flex-shrink-0 text-[#bdc3c5] transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
                />
            </button>

            {open && (
                <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-[#dde2e5] bg-white shadow-lg">
                    {options.map((opt) => (
                        <li key={opt}>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(opt);
                                    setOpen(false);
                                }}
                                className={[
                                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                                    "transition-colors duration-100 hover:bg-[#f1f4f6]",
                                    value === opt ? "font-semibold text-[#50adc9]" : "text-[#3e484c]",
                                ].join(" ")}
                            >
                                {value === opt ? (
                                    <Check size={13} className="flex-shrink-0 text-[#50adc9]" />
                                ) : (
                                    <span className="w-[13px]" />
                                )}
                                {opt}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

interface CheckGroupProps {
    options: { value: string; label: string }[];
    value: string[];
    onChange: (v: string[]) => void;
    hasError?: boolean;
}
const CheckGroup: React.FC<CheckGroupProps> = ({ options, value, onChange, hasError }) => {
    const toggle = (opt: string) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
    return (
        <div className={["flex flex-wrap gap-2 rounded-lg border p-3", hasError ? "border-rose-400" : "border-[#dde2e5]"].join(" ")}>
            {options.map((opt) => {
                const checked = value.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt.value)}
                        className={[
                            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium",
                            "transition-colors duration-150",
                            checked
                                ? "border-[#50adc9] bg-[#50adc9]/10 text-[#50adc9]"
                                : "border-[#dde2e5] bg-white text-[#3e484c] hover:border-[#50adc9]/40",
                        ].join(" ")}
                    >
                        {checked && <Check size={11} />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

const SectionHeading: React.FC<{ title: string; sub?: boolean }> = ({ title, sub }) => (
    <div className={["flex items-center gap-2", sub ? "mt-2 mb-4" : "mb-5"].join(" ")}>
        <div className={["rounded-full", sub ? "h-4 w-1 bg-[#50adc9]/40" : "h-5 w-1.5 bg-[#50adc9]"].join(" ")} />
        <h3 className={["font-semibold text-[#3e484c]", sub ? "text-sm" : ""].join(" ")}>{title}</h3>
    </div>
);

const Collapsible: React.FC<{ open: boolean; children: React.ReactNode }> = ({ open, children }) => (
    <div
        className={[
            "transition-all duration-300",
            open ? "max-h-[2000px] overflow-visible opacity-100" : "pointer-events-none max-h-0 overflow-hidden opacity-0",
        ].join(" ")}
    >
        {children}
    </div>
);

const EventFormPage: React.FC = () => {
    const [step, setStep] = useState(0);
    const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
    const [interactedToggles, setInteractedToggles] = useState<Record<string, boolean>>({});
    const [fileList, setFileList] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [serverErrors, setServerErrors] = useState<string[]>([]);
    const indicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

    const getSavedValues = (): Partial<EventFormValues> => {
        try {
            const raw = localStorage.getItem("eventFormProgress");
            if (raw) return JSON.parse(raw);
        } catch {
            /* ignore */
        }
        return {};
    };

    const {
        control,
        register,
        handleSubmit,
        watch,
        getValues,
        trigger,
        formState: { errors },
    } = useForm<EventFormInputValues, undefined, EventFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { ...DEFAULT_VALUES, ...getSavedValues() } as EventFormInputValues,
        mode: "onChange",
    });
    console.log("form errors:", errors);

    const watched = watch();

    useEffect(() => {
        try {
            const raw = localStorage.getItem("eventFormToggles");
            if (raw) setInteractedToggles(JSON.parse(raw));
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        indicatorRefs.current[step]?.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest",
        });
    }, [step]);

    const markInteracted = (field: string) => setInteractedToggles((prev) => ({ ...prev, [field]: true }));

    const saveProgress = () => {
        localStorage.setItem("eventFormProgress", JSON.stringify(getValues()));
        localStorage.setItem("eventFormToggles", JSON.stringify(interactedToggles));
    };

    const getStepStatus = (idx: number): "unvisited" | "complete" | "incomplete" => {
        if (!visitedSteps.has(idx)) return "unvisited";
        // Step 4 is fully optional — always complete once visited
        if (idx === 3) return "complete";
        const fields = STEP_FIELDS[idx];
        const hasErrors = fields.some((f) => !!errors[f]);
        if (hasErrors) return "incomplete";
        const allFilled = fields.every((f) => {
            const v = watched[f];
            if (typeof v === "boolean") return interactedToggles[f] !== undefined;
            if (Array.isArray(v)) return true;
            if (typeof v === "number") return v > 0;
            return v !== "" && v !== undefined && v !== null;
        });
        return allFilled ? "complete" : "incomplete";
    };

    const goNext = async () => {
        const fields = STEP_FIELDS[step] as (keyof EventFormValues)[];
        const valid = await trigger(fields);
        if (!valid) return;
        const next = Math.min(step + 1, 4);
        setStep(next);
        setVisitedSteps((prev) => new Set([...prev, next]));
    };

    const goPrev = () => setStep((p) => Math.max(p - 1, 0));

    const buildFormData = (data: EventFormValues): FormData => {
        const fd = new FormData();
        (Object.keys(data) as (keyof EventFormValues)[]).forEach((key) => {
            if (key === ("filePath" as keyof EventFormValues)) return;
            const val = data[key];
            if (typeof val === "boolean") fd.append(key, val ? "1" : "0");
            else if (Array.isArray(val)) fd.append(key, JSON.stringify(val));
            else if (val !== undefined && val !== null) fd.append(key, String(val));
        });
        console.log(fileList);
        if (fileList[0]) fd.append("filePath", fileList[0]);
        return fd;
    };

    const onSubmit: SubmitHandler<EventFormValues> = async (data) => {
        setSubmitting(true);
        setServerErrors([]);

        const fd = buildFormData(data);
        console.log(fd);

        try {
            const res = await sendEventForm(fd);

            if (!res.ok) {
                const resData = await res.json().catch(() => ({}));
                const errs: string[] = resData?.errors
                    ? (Object.values(resData.errors).flat() as string[])
                    : [resData?.message ?? "Hiba történt a beküldés során."];
                setServerErrors(errs);
                return;
            }

            setSuccessMessage("A kérvényt sikeresen rögzítettük. Köszönjük!");
            localStorage.removeItem("eventFormProgress");
            localStorage.removeItem("eventFormToggles");
        } catch {
            setServerErrors(["Hálózati hiba. Kérjük, próbálja újra."]);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep0 = () => (
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
                <Field label="Rendezvény neve" required error={errors.name?.message}>
                    <StyledInput {...register("name")} placeholder="Rendezvény neve" hasError={!!errors.name} />
                </Field>
            </div>
            <div className="sm:col-span-2">
                <Field label="Rendezvény leírása" required error={errors.description?.message}>
                    <StyledInput {...register("description")} placeholder="Rövid leírás" hasError={!!errors.description} />
                </Field>
            </div>
            <Field label="Helyszín neve" required error={errors.location?.message}>
                <StyledInput {...register("location")} placeholder="Pl. Aula, E épület" hasError={!!errors.location} />
            </Field>
            <Field label="Pontos cím" required error={errors.address?.message}>
                <StyledInput {...register("address")} placeholder="Utca, házszám" hasError={!!errors.address} />
            </Field>
            <Field label="Kezdés időpontja" required error={errors.startDate?.message}>
                <StyledInput type="datetime-local" {...register("startDate")} hasError={!!errors.startDate} />
            </Field>
            <Field label="Zárás időpontja" required error={errors.endDate?.message}>
                <StyledInput type="datetime-local" {...register("endDate")} hasError={!!errors.endDate} />
            </Field>
            <Field label="Rendezvény típusa" required error={errors.type?.message}>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Dropdown
                            options={[
                                "Egyetemi szervezésű rendezvények",
                                "Hallgatói rendezvények",
                                "Külső szervezésű rendezvények",
                                "Sportrendezvények",
                                "Egyetemi szervezésű sportrendezvények",
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            hasError={!!errors.type}
                        />
                    )}
                />
            </Field>
            <Field label="Rendezvény minősítése" required error={errors.qualification?.message}>
                <Controller
                    name="qualification"
                    control={control}
                    render={({ field }) => (
                        <Dropdown
                            options={["Nyílvános", "Zártkörű"]}
                            value={field.value}
                            onChange={field.onChange}
                            hasError={!!errors.qualification}
                        />
                    )}
                />
            </Field>
            <div className="sm:col-span-2">
                <Field label="Várható résztvevők száma (fő)" required error={errors.participants?.message}>
                    <StyledInput
                        type="number"
                        min={1}
                        {...register("participants", { valueAsNumber: true })}
                        hasError={!!errors.participants}
                        className="sm:w-1/2"
                    />
                </Field>
            </div>
            <div className="sm:col-span-2">
                <Controller
                    name="public"
                    control={control}
                    render={({ field }) => (
                        <ToggleRow
                            label="Sajtónyilvános rendezvény?"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            interacted={!!interactedToggles["public"]}
                            onFirstInteract={() => markInteracted("public")}
                        />
                    )}
                />
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <Field label="Rendezvény jellege" required error={errors.nature?.message}>
                        <StyledInput {...register("nature")} placeholder="Pl. kulturális, sport, tudományos…" hasError={!!errors.nature} />
                    </Field>
                </div>
                <div className="sm:col-span-2">
                    <Field label="Részletes programterv" required error={errors.detailedProgramPlan?.message}>
                        <StyledInput
                            {...register("detailedProgramPlan")}
                            placeholder="Program leírása"
                            hasError={!!errors.detailedProgramPlan}
                        />
                    </Field>
                </div>
                <div className="sm:col-span-2">
                    <Field label="Helyszín berendezési módja" required error={errors.furnishedMethod?.message}>
                        <StyledInput
                            {...register("furnishedMethod")}
                            hasError={!!errors.furnishedMethod}
                            placeholder="Asztalok, székek elrendezése…"
                        />
                    </Field>
                </div>
            </div>

            <Controller
                name="needAccommodation"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Van szállásigénye?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needAccommodation"]}
                        onFirstInteract={() => markInteracted("needAccommodation")}
                    />
                )}
            />
            <Collapsible open={watched.needAccommodation}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Szállásigény várható létszáma" required error={errors.needAccommodationNumber?.message}>
                        <StyledInput
                            type="number"
                            min={1}
                            {...register("needAccommodationNumber", { valueAsNumber: true })}
                            hasError={!!errors.needAccommodationNumber}
                            className="sm:w-1/2"
                        />
                    </Field>
                </div>
            </Collapsible>

            {/* ── Parking ── */}
            <Controller
                name="needParkingSpace"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Van parkolóhely igénye?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needParkingSpace"]}
                        onFirstInteract={() => markInteracted("needParkingSpace")}
                    />
                )}
            />
            <Collapsible open={watched.needParkingSpace}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Várható gépkocsiszám és parkolóhely igény" required error={errors.needParkingSpaceNumber?.message}>
                        <StyledInput
                            type="number"
                            min={1}
                            {...register("needParkingSpaceNumber", { valueAsNumber: true })}
                            hasError={!!errors.needParkingSpaceNumber}
                            className="sm:w-1/2"
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="producesTrash"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Keletkezik hulladék?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["producesTrash"]}
                        onFirstInteract={() => markInteracted("producesTrash")}
                    />
                )}
            />
            <Collapsible open={watched.producesTrash}>
                <div className="relative z-[1000] mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <div className="relative z-50">
                        <Field label="Hulladék elszállításának módja" required error={errors.producesTrashDelivery?.message}>
                            <Controller
                                name="producesTrashDelivery"
                                control={control}
                                render={({ field }) => (
                                    <Dropdown
                                        options={["Saját úton", "Egyetem által biztosítva"]}
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        hasError={!!errors.producesTrashDelivery}
                                    />
                                )}
                            />
                        </Field>
                        <Collapsible open={watched.producesTrashDelivery === "Saját úton"}>
                            <Field label="Ki szállítja el?" required error={errors.producesTrashDeliveryWhoDelivers?.message}>
                                <StyledInput
                                    {...register("producesTrashDeliveryWhoDelivers")}
                                    placeholder="Elszállító neve / cég"
                                    hasError={!!errors.producesTrashDeliveryWhoDelivers}
                                />
                            </Field>
                        </Collapsible>
                    </div>
                </div>
            </Collapsible>

            <Controller
                name="needWifi"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Szükséges WiFi?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needWifi"]}
                        onFirstInteract={() => markInteracted("needWifi")}
                    />
                )}
            />

            <Controller
                name="needEducationalTechnology"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Szükséges oktatástechnikai támogatás?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needEducationalTechnology"]}
                        onFirstInteract={() => markInteracted("needEducationalTechnology")}
                    />
                )}
            />
            <Collapsible open={watched.needEducationalTechnology}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Oktatástechnikai eszközigény" required error={errors.needEducationalTechnologyItems?.message}>
                        <StyledInput
                            {...register("needEducationalTechnologyItems")}
                            placeholder="Pl. projektor, mikrofon, laptop…"
                            hasError={!!errors.needEducationalTechnologyItems}
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="participantsWithReducedMobility"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Korlátozott mozgású személyek részt vesznek?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["participantsWithReducedMobility"]}
                        onFirstInteract={() => markInteracted("participantsWithReducedMobility")}
                    />
                )}
            />

            <Controller
                name="willBePhotos"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Fotó / videófelvétel készül?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["willBePhotos"]}
                        onFirstInteract={() => markInteracted("willBePhotos")}
                    />
                )}
            />
            <Collapsible open={watched.willBePhotos}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Milyen eszközzel?" required error={errors.willBePhotosDevice?.message}>
                        <StyledInput
                            {...register("willBePhotosDevice")}
                            placeholder="Pl. DSLR kamera, telefon…"
                            hasError={!!errors.willBePhotosDevice}
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="needCatering"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Lesz catering?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needCatering"]}
                        onFirstInteract={() => markInteracted("needCatering")}
                    />
                )}
            />
            <Collapsible open={watched.needCatering}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Catering típusa" required error={errors.needCateringType?.message}>
                        <Controller
                            name="needCateringType"
                            control={control}
                            render={({ field }) => (
                                <CheckGroup
                                    options={[
                                        { value: "Hideg étel", label: "Hideg étel" },
                                        { value: "Meleg étel", label: "Meleg étel" },
                                        { value: "Italok", label: "Kávé, tea, üdítő" },
                                    ]}
                                    value={field.value ?? []}
                                    onChange={field.onChange}
                                    hasError={!!errors.needCateringType}
                                />
                            )}
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="willBeConstruction"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Várhatóak építési / bontási munkálatok?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["willBeConstruction"]}
                        onFirstInteract={() => markInteracted("willBeConstruction")}
                    />
                )}
            />
            <Collapsible open={watched.willBeConstruction}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                        <Field label="Terület igénybevételének kezdése" required error={errors.constructionStartDate?.message}>
                            <StyledInput
                                type="datetime-local"
                                {...register("constructionStartDate")}
                                hasError={!!errors.constructionStartDate}
                            />
                        </Field>
                        <Field label="Terület visszaadása" required error={errors.constructionEndDate?.message}>
                            <StyledInput
                                type="datetime-local"
                                {...register("constructionEndDate")}
                                hasError={!!errors.constructionEndDate}
                            />
                        </Field>
                    </div>
                    <Field label="Megjelenő alvállalkozók" required error={errors.constructionSubcontractors?.message}>
                        <StyledInput
                            {...register("constructionSubcontractors")}
                            placeholder="Cégek / nevek"
                            hasError={!!errors.constructionSubcontractors}
                        />
                    </Field>
                    <Controller
                        name="constructionInHeights"
                        control={control}
                        render={({ field }) => (
                            <ToggleRow
                                label="Magasban végzett munka?"
                                value={field.value}
                                onChange={field.onChange}
                                interacted={!!interactedToggles["constructionInHeights"]}
                                onFirstInteract={() => markInteracted("constructionInHeights")}
                            />
                        )}
                    />
                    <Controller
                        name="constructionNeedScaffolding"
                        control={control}
                        render={({ field }) => (
                            <ToggleRow
                                label="Szükséges állványzat?"
                                value={field.value}
                                onChange={field.onChange}
                                interacted={!!interactedToggles["constructionNeedScaffolding"]}
                                onFirstInteract={() => markInteracted("constructionNeedScaffolding")}
                            />
                        )}
                    />
                    <Controller
                        name="constructionManualMaterialHandling"
                        control={control}
                        render={({ field }) => (
                            <ToggleRow
                                label="Kézi anyagmozgatás?"
                                value={field.value}
                                onChange={field.onChange}
                                interacted={!!interactedToggles["constructionManualMaterialHandling"]}
                                onFirstInteract={() => markInteracted("constructionManualMaterialHandling")}
                            />
                        )}
                    />
                    <Controller
                        name="constructionMechanicalMaterialHandling"
                        control={control}
                        render={({ field }) => (
                            <ToggleRow
                                label="Gépi anyagmozgatás?"
                                value={field.value}
                                onChange={field.onChange}
                                interacted={!!interactedToggles["constructionMechanicalMaterialHandling"]}
                                onFirstInteract={() => markInteracted("constructionMechanicalMaterialHandling")}
                            />
                        )}
                    />
                    <Collapsible open={watched.constructionMechanicalMaterialHandling}>
                        <Field label="Gépi berendezések">
                            <Controller
                                name="constructionMechanicalMaschines"
                                control={control}
                                render={({ field }) => (
                                    <CheckGroup
                                        options={[
                                            { value: "forklift", label: "Targonca" },
                                            { value: "crane", label: "Daru" },
                                            { value: "Egyéb", label: "Egyéb" },
                                        ]}
                                        value={field.value ?? []}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </Field>
                        <Collapsible open={(watched.constructionMechanicalMaschines ?? []).includes("Egyéb")}>
                            <Field label="Egyéb gép leírása">
                                <StyledInput {...register("constructionMechanicalMaschinesOthers")} placeholder="Leírás" />
                            </Field>
                        </Collapsible>
                    </Collapsible>
                </div>
            </Collapsible>

            <Controller
                name="needCleaningBefore"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Takarítás szükséges a rendezvény előtt?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needCleaningBefore"]}
                        onFirstInteract={() => markInteracted("needCleaningBefore")}
                    />
                )}
            />
            <Controller
                name="needCleaningDuringEvent"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Takarítás szükséges a rendezvény alatt?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needCleaningDuringEvent"]}
                        onFirstInteract={() => markInteracted("needCleaningDuringEvent")}
                    />
                )}
            />

            <Field label="Villanyszerelési igény" error={errors.needElectricians?.message}>
                <Controller
                    name="needElectricians"
                    control={control}
                    render={({ field }) => (
                        <CheckGroup
                            options={[
                                { value: "Normál feszültség", label: "Normál feszültség" },
                                { value: "Magasfeszültség", label: "Magasfeszültség" },
                                { value: "Nem szükséges", label: "Nem szükséges" },
                            ]}
                            value={field.value ?? []}
                            onChange={field.onChange}
                        />
                    )}
                />
            </Field>

            <Controller
                name="needElectricityFromCabinet"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Szükséges elektromos energia szekrényből?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["needElectricityFromCabinet"]}
                        onFirstInteract={() => markInteracted("needElectricityFromCabinet")}
                    />
                )}
            />
            <Collapsible open={watched.needElectricityFromCabinet}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Szekrény száma / azonosítója" required error={errors.needElectricityFromCabinetNumber?.message}>
                        <StyledInput
                            {...register("needElectricityFromCabinetNumber")}
                            placeholder="Pl. E-12"
                            hasError={!!errors.needElectricityFromCabinetNumber}
                            className="sm:w-1/2"
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="fireHazardExpected"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Várható tűzveszélyes tevékenység?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["fireHazardExpected"]}
                        onFirstInteract={() => markInteracted("fireHazardExpected")}
                    />
                )}
            />
            <Collapsible open={watched.fireHazardExpected}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Tevékenység leírása" required error={errors.fireHazardExpectedDescription?.message}>
                        <StyledInput
                            {...register("fireHazardExpectedDescription")}
                            placeholder="Részletes leírás"
                            hasError={!!errors.fireHazardExpectedDescription}
                        />
                    </Field>
                </div>
            </Collapsible>

            <Field label="Várható por, füst, páraképződés" required error={errors.expectedDustSmokeVapor?.message}>
                <Controller
                    name="expectedDustSmokeVapor"
                    control={control}
                    render={({ field }) => (
                        <CheckGroup
                            options={[
                                { value: "Por", label: "Por" },
                                { value: "Füst", label: "Füst" },
                                { value: "Páraképződés", label: "Páraképződés" },
                                { value: "Nem", label: "Egyik sem" },
                            ]}
                            value={field.value ?? []}
                            onChange={field.onChange}
                        />
                    )}
                />
            </Field>

            <Controller
                name="expectedUsageOfChemicals"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Vegyi anyag felhasználása várható?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["expectedUsageOfChemicals"]}
                        onFirstInteract={() => markInteracted("expectedUsageOfChemicals")}
                    />
                )}
            />
            <Collapsible open={watched.expectedUsageOfChemicals}>
                <div className="mb-4 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <Field label="Tevékenység leírása" required error={errors.expectedUsageOfChemicalsDescription?.message}>
                        <StyledInput
                            {...register("expectedUsageOfChemicalsDescription")}
                            placeholder="Milyen vegyszer, milyen célból…"
                            hasError={!!errors.expectedUsageOfChemicalsDescription}
                        />
                    </Field>
                </div>
            </Collapsible>

            <Controller
                name="expectedDecor"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Várható dekoráció a helyiség légterében?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["expectedDecor"]}
                        onFirstInteract={() => markInteracted("expectedDecor")}
                    />
                )}
            />
        </div>
    );

    const renderStep2 = () => (
        <div>
            <SectionHeading title="Elsődleges szervező" />
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <Field label="Teljes név" required error={errors.organizerFullName?.message}>
                    <StyledInput
                        {...register("organizerFullName")}
                        placeholder="Vezetéknév Keresztnév"
                        hasError={!!errors.organizerFullName}
                    />
                </Field>
                <Field label="Telefonszám" required error={errors.organizerPhone?.message}>
                    <StyledInput
                        type="tel"
                        {...register("organizerPhone")}
                        placeholder="+36 xx xxx xxxx"
                        hasError={!!errors.organizerPhone}
                    />
                </Field>
                <Field label="E-mail cím" required error={errors.organizerEmail?.message}>
                    <StyledInput
                        type="email"
                        {...register("organizerEmail")}
                        placeholder="pelda@email.hu"
                        hasError={!!errors.organizerEmail}
                    />
                </Field>
                <Field label="Lakcím" required error={errors.organizerAddress?.message}>
                    <StyledInput
                        {...register("organizerAddress")}
                        placeholder="Ir.szám, Város, Utca"
                        hasError={!!errors.organizerAddress}
                    />
                </Field>
            </div>

            <Controller
                name="moreOrganizer"
                control={control}
                render={({ field }) => (
                    <ToggleRow
                        label="Van további szervező?"
                        required
                        value={field.value}
                        onChange={field.onChange}
                        interacted={!!interactedToggles["moreOrganizer"]}
                        onFirstInteract={() => markInteracted("moreOrganizer")}
                    />
                )}
            />

            <Collapsible open={watched.moreOrganizer}>
                <div className="mt-2 ml-2 border-l-2 border-[#50adc9]/30 pl-4">
                    <SectionHeading title="Másodlagos szervező" sub />
                    <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                        <Field label="Teljes név" required error={errors.secondOrganizerFullName?.message}>
                            <StyledInput
                                {...register("secondOrganizerFullName")}
                                placeholder="Vezetéknév Keresztnév"
                                hasError={!!errors.secondOrganizerFullName}
                            />
                        </Field>
                        <Field label="Telefonszám" required error={errors.secondOrganizerPhone?.message}>
                            <StyledInput
                                type="tel"
                                {...register("secondOrganizerPhone")}
                                placeholder="+36 xx xxx xxxx"
                                hasError={!!errors.secondOrganizerPhone}
                            />
                        </Field>
                        <Field label="E-mail cím" required error={errors.secondOrganizerEmail?.message}>
                            <StyledInput
                                type="email"
                                {...register("secondOrganizerEmail")}
                                placeholder="pelda@email.hu"
                                hasError={!!errors.secondOrganizerEmail}
                            />
                        </Field>
                        <Field label="Lakcím" required error={errors.secondOrganizerAddress?.message}>
                            <StyledInput
                                {...register("secondOrganizerAddress")}
                                placeholder="Ir.szám, Város, Utca"
                                hasError={!!errors.secondOrganizerAddress}
                            />
                        </Field>
                    </div>
                </div>
            </Collapsible>
        </div>
    );

    const renderStep3 = () => (
        <div>
            <p className="mb-5 text-sm text-[#3e484c]/60">
                Töltse ki az alábbi mezőket, ha a rendezvénynek jogi háttere van (pl. céges megrendelő). Minden mező opcionális ezen a
                lapon.
            </p>
            <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <Field label="Név / Cégnév">
                    <StyledInput {...register("customerWithLegalBackgroundName")} placeholder="Kovács Kft." />
                </Field>
                <Field label="Cím">
                    <StyledInput {...register("customerWithLegalBackgroundAddress")} placeholder="Ir.szám, Város, Utca" />
                </Field>
                <Field label="Adószám">
                    <StyledInput {...register("customerWithLegalBackgroundTaxNumber")} placeholder="12345678-1-23" />
                </Field>
                <Field label="Nyílvántartási/Cégjegyzékszám">
                    <StyledInput {...register("registrationNumber")} placeholder="01-01-123456 " />
                </Field>
                <Field label="Telefonszám">
                    <StyledInput type="tel" {...register("customerWithLegalBackgroundPhone")} placeholder="+36 xx xxx xxxx" />
                </Field>
                <Field label="E-mail cím">
                    <StyledInput type="email" {...register("customerWithLegalBackgroundEmail")} placeholder="pelda@ceg.hu" />
                </Field>
                <Field label="Titulus">
                    <StyledInput type="tel" {...register("RepresentativeTitle")} placeholder="Dr." />
                </Field>
                <Field label="Képviselő neve">
                    <StyledInput type="email" {...register("Representative")} placeholder="Kovács Kovács" />
                </Field>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div>
            <p className="mb-5 text-sm text-[#3e484c]/60">
                Töltsön fel helyszín berendezési rajzot, ha rendelkezésre áll. Ez a mező nem kötelező. (max. 6 MB)
            </p>
            <label
                className={[
                    "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12",
                    "transition-colors duration-200",
                    fileList.length > 0
                        ? "border-[#50adc9] bg-[#50adc9]/5"
                        : "border-[#dde2e5] bg-[#f1f4f6] hover:border-[#50adc9]/50 hover:bg-[#50adc9]/5",
                ].join(" ")}
            >
                {fileList.length === 0 ? (
                    <>
                        <UploadCloud size={40} className="text-[#bdc3c5]" />
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#50adc9]">Kattintson a böngészéshez</p>
                            <p className="mt-0.5 text-xs text-[#3e484c]/50">vagy húzza ide a fájlt</p>
                        </div>
                        <p className="text-xs text-[#bdc3c5]">PDF, PNG, JPG – max. 6 MB</p>
                    </>
                ) : (
                    <div className="flex w-full items-center justify-between rounded-lg border border-[#dde2e5] bg-white px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#50adc9]/10">
                                <Upload size={18} className="text-[#50adc9]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-[#3e484c]">{fileList[0].name}</p>
                                <p className="text-xs text-[#bdc3c5]">{(fileList[0].size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setFileList([]);
                            }}
                            className="rounded-lg p-1.5 text-[#bdc3c5] transition-colors hover:bg-[#f1f4f6] hover:text-[#3e484c]"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                        if (e.target.files?.[0]) setFileList([e.target.files[0]]);
                    }}
                />
            </label>
        </div>
    );

    const STEPS = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

    return (
        <div className="min-h-screen bg-[#f1f4f6] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-8 w-1.5 rounded-full bg-[#50adc9]" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[#3e484c]">Rendezvény bejelentő kérvény</h1>
                        <p className="text-sm text-[#3e484c]/50">Töltse ki az összes lépést, majd küldje el a kérvényt.</p>
                    </div>
                </div>

                <div className="mb-6 overflow-x-auto rounded-xl bg-white p-4 shadow-sm">
                    <div className="flex min-w-max items-start">
                        {STAGES.map((stage, idx) => {
                            const status = getStepStatus(idx);
                            const isActive = idx === step;
                            return (
                                <React.Fragment key={idx}>
                                    <div
                                        ref={(el) => {
                                            indicatorRefs.current[idx] = el;
                                        }}
                                        className="flex flex-col items-center"
                                        style={{ minWidth: 108 }}
                                    >
                                        <div
                                            className={[
                                                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                                                "ring-2 transition-all duration-200",
                                                isActive
                                                    ? "bg-[#50adc9] text-white shadow-md shadow-[#50adc9]/25 ring-[#50adc9]/30"
                                                    : status === "complete"
                                                      ? "bg-emerald-500 text-white ring-emerald-500/20"
                                                      : status === "incomplete"
                                                        ? "bg-rose-400 text-white ring-rose-400/20"
                                                        : "bg-[#f1f4f6] text-[#bdc3c5] ring-transparent",
                                            ].join(" ")}
                                        >
                                            {status === "complete" && !isActive ? <Check size={15} strokeWidth={3} /> : idx + 1}
                                        </div>
                                        <span
                                            className={[
                                                "mt-2 text-center text-[10px] leading-tight font-medium transition-colors",
                                                isActive ? "text-[#50adc9]" : "text-[#3e484c]/40",
                                            ].join(" ")}
                                        >
                                            {stage}
                                        </span>
                                    </div>
                                    {idx < STAGES.length - 1 && (
                                        <div
                                            className={[
                                                "mt-[18px] h-px flex-1 transition-colors duration-300",
                                                status === "complete" ? "bg-emerald-300" : "bg-[#ebeef0]",
                                            ].join(" ")}
                                            style={{ minWidth: 16 }}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {serverErrors.length > 0 && (
                    <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3">
                        {serverErrors.map((e, i) => (
                            <p key={i} className="text-sm font-medium text-rose-600">
                                {e}
                            </p>
                        ))}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-semibold text-emerald-700">{successMessage}</p>
                    </div>
                )}

                <div className="rounded-xl bg-white shadow-sm">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-6">{STEPS[step]()}</div>

                        <div className="flex items-center justify-between border-t border-[#ebeef0] px-6 py-4">
                            {/* Back */}
                            {step > 0 ? (
                                <button
                                    key="next-step-button"
                                    type="button"
                                    onClick={goPrev}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dde2e5] bg-white px-4 py-2 text-sm font-medium text-[#3e484c] transition-colors hover:bg-[#f1f4f6]"
                                >
                                    <ArrowLeft size={15} />
                                    Előző
                                </button>
                            ) : (
                                <div />
                            )}

                            {/* Save progress */}
                            <button
                                type="button"
                                onClick={saveProgress}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dde2e5] px-4 py-2 text-sm font-medium text-[#3e484c] transition-colors hover:bg-[#f1f4f6]"
                            >
                                <Save size={15} />
                                Mentés
                            </button>

                            {/* Next / Submit */}
                            {step < 4 ? (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#50adc9] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#50adc9]/30 transition-all hover:bg-[#3d9ab6] active:scale-95"
                                >
                                    Következő
                                    <ArrowRight size={15} />
                                </button>
                            ) : (
                                <button
                                    key="submit-form-button"
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={submitting}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#50adc9] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#50adc9]/30 transition-all hover:bg-[#3d9ab6] active:scale-95 disabled:opacity-60"
                                >
                                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                                    Küldés
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventFormPage;
