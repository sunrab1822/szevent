import { z } from "zod";

export const eventSchema = z
    .object({
        // --- STEP 1: Alapadatok ---
        eventName: z.string().min(1, "A rendezvény neve kötelező"),
        eventDescription: z.string().min(1, "A leírás kötelező"),
        eventLocation: z.string().min(1, "A helyszín kötelező"),
        eventAddress: z.string().min(1, "A pontos cím kötelező"),
        eventStartDate: z.string().min(1, "A kezdés kötelező"),
        eventEndDate: z.string().min(1, "A befejezés kötelező"),
        eventType: z.string().min(1, "A típus kötelező"),
        eventQualification: z.string().min(1, "A minősítés kötelező"),
        eventParticipants: z.number().min(1, "Legalább 1 fő"),
        eventPublic: z.boolean(),

        // --- STEP 2: Részletek ---
        eventNature: z.string().min(1, "A jelleg kötelező"),
        eventFurnishedMethod: z.string().optional(),
        eventDetailedProgramPlan: z.string().min(1, "A programterv kötelező"),

        eventNeedAccommodation: z.boolean(),
        eventNeedAccommodationNumber: z.number().optional(),

        eventNeedParkingSpace: z.boolean(),
        eventNeedParkingSpaceNumber: z.number().optional(),

        eventProducesTrash: z.boolean(),
        eventProducesTrashDelivery: z.string().nullable().optional(),
        eventProducesTrashDeliveryWhoDelivers: z.string().optional(),

        eventNeedWifi: z.boolean(),
        eventParticipantsWithReducedMobility: z.boolean(),

        eventNeedEducationalTechnology: z.boolean(),
        eventNeedEducationalTechnologyItems: z.string().optional(),

        eventWillBePhotos: z.boolean(),
        eventWillBePhotosDevice: z.string().optional(),

        eventNeedCatering: z.boolean(),
        eventNeedCateringType: z.array(z.string()).optional(),

        eventWillBeConstruction: z.boolean(),
        eventConstructionStartDate: z.string().optional(),
        eventConstructionEndDate: z.string().optional(),
        eventConstructionSubcontractors: z.string().optional(),
        eventConstructionInHeights: z.boolean().optional(),
        eventConstructionNeedScaffolding: z.boolean().optional(),
        eventConstructionManualMaterialHandling: z.boolean().optional(),
        eventConstructionMechanicalMaterialHandling: z.boolean().optional(),
        eventConstructionMechanicalMaschines: z.array(z.string()).optional(),
        eventConstructionMechanicalMaschinesOthers: z.string().optional(),

        eventNeedCleaningBefore: z.boolean(),
        eventNeedCleaningDuringEvent: z.boolean(),

        eventNeedElectricians: z.array(z.string()).min(1, "Kötelező választani"),
        eventNeedElectricityFromCabinet: z.boolean(),
        eventNeedElectricityFromCabinetNumber: z.string().optional(),

        eventFireHazardExpected: z.boolean(),
        eventFireHazardExpectedDescription: z.string().optional(),

        eventExpectedDustSmokeVapor: z.array(z.string()).min(1, "Kötelező választani"),

        eventExpectedUsageOfChemicals: z.boolean(),
        eventExpectedUsageOfChemicalsDescription: z.string().optional(),
        eventExpectedDecor: z.boolean(),

        // --- STEP 3: Szervező ---
        eventOrganizerFullName: z.string().min(1, "A név kötelező"),
        eventOrganizerPhone: z.string().min(1, "A telefonszám kötelező"),
        eventOrganizerEmail: z.string().email("Érvénytelen e-mail cím"),
        eventOrganizerAddress: z.string().min(1, "A lakcím kötelező"),
        eventMoreOrganizer: z.boolean(),
        eventSecondOrganizerFullName: z.string().optional(),
        eventSecondOrganizerPhone: z.string().optional(),
        eventSecondOrganizerEmail: z.string().optional(),
        eventSecondOrganizerAddress: z.string().optional(),

        // --- STEP 4: Jogi háttér (Optional) ---
        eventCustomerWithLegalBackgroundName: z.string().optional(),
        eventCustomerWithLegalBackgroundAddress: z.string().optional(),
        eventCustomerWithLegalBackgroundTaxNumber: z.string().optional(),
        eventCustomerWithLegalBackgroundPhone: z.string().optional(),
        eventCustomerWithLegalBackgroundEmail: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Taming the "shitty logic" conditionally!
        if (data.eventNeedAccommodation && (!data.eventNeedAccommodationNumber || data.eventNeedAccommodationNumber < 1)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["eventNeedAccommodationNumber"], message: "Kötelező mező" });
        }
        if (data.eventProducesTrash && !data.eventProducesTrashDelivery) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["eventProducesTrashDelivery"], message: "Válassza ki a módot" });
        }
        if (data.eventWillBeConstruction) {
            if (!data.eventConstructionStartDate)
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["eventConstructionStartDate"], message: "Kötelező" });
            if (!data.eventConstructionEndDate)
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["eventConstructionEndDate"], message: "Kötelező" });
        }
        if (data.eventMoreOrganizer) {
            if (!data.eventSecondOrganizerFullName)
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["eventSecondOrganizerFullName"], message: "Kötelező" });
        }
    });

export type EventFormValues = z.infer<typeof eventSchema>;

// We map fields to steps for the `trigger()` validation
export const FORM_STEPS_FIELDS: (keyof EventFormValues)[][] = [
    [
        "eventName",
        "eventDescription",
        "eventLocation",
        "eventAddress",
        "eventStartDate",
        "eventEndDate",
        "eventType",
        "eventQualification",
        "eventParticipants",
        "eventPublic",
    ],
    [
        "eventNature",
        "eventDetailedProgramPlan",
        "eventNeedElectricians",
        "eventExpectedDustSmokeVapor",
        "eventNeedAccommodation",
        "eventNeedParkingSpace",
        "eventProducesTrash",
        "eventNeedWifi",
        "eventNeedEducationalTechnology",
        "eventParticipantsWithReducedMobility",
        "eventWillBePhotos",
        "eventNeedCatering",
        "eventWillBeConstruction",
        "eventNeedCleaningBefore",
        "eventNeedCleaningDuringEvent",
        "eventNeedElectricityFromCabinet",
        "eventFireHazardExpected",
        "eventExpectedUsageOfChemicals",
        "eventExpectedDecor",
    ],
    ["eventOrganizerFullName", "eventOrganizerPhone", "eventOrganizerEmail", "eventOrganizerAddress", "eventMoreOrganizer"],
    [
        "eventCustomerWithLegalBackgroundName",
        "eventCustomerWithLegalBackgroundAddress",
        "eventCustomerWithLegalBackgroundTaxNumber",
        "eventCustomerWithLegalBackgroundPhone",
        "eventCustomerWithLegalBackgroundEmail",
    ],
    [], // File upload step doesn't use standard schema validation
];
