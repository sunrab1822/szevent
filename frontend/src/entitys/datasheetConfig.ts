import type { Event } from "./event";

export type ConfigTypes = "textarea" | "number" | "boolean" | "datetime-local" | "checkbox" | "tel" | "email";
interface FieldConfig {
    label: string;
    fieldKey: keyof Event;
    type?: ConfigTypes;
    condition?: (event: Event) => boolean;
}

export const datasheetBaseDataConfig: FieldConfig[] = [
    { label: "Név", fieldKey: "name" },
    { label: "Hely", fieldKey: "location" },
    { label: "Kezdés ideje", fieldKey: "startDate", type: "datetime-local" },
    { label: "Zárás ideje", fieldKey: "endDate", type: "datetime-local" },
    { label: "Pontos cím", fieldKey: "address" },
    { label: "Típus", fieldKey: "type" },
    { label: "Minősítés", fieldKey: "qualification" },
    { label: "Sajtónyílvános", fieldKey: "public", type: "boolean" },
    { label: "Leírás", fieldKey: "description" },
    { label: "Résztvevők várható létszáma", fieldKey: "participants", type: "number" },
];

export const datasheetDetailsDataConfig: FieldConfig[] = [
    { label: "Jelleg", fieldKey: "nature" },
    { label: "Részletes rogramterv", fieldKey: "detailedProgramPlan" },
    { label: "Berendezési mód", fieldKey: "furnishedMethod" },
    { label: "Szállásigény", fieldKey: "needAccommodation", type: "boolean" },
    {
        label: "Szállásigény letszáma",
        fieldKey: "needAccommodationNumber",
        type: "number",
        condition: (event) => !!event.needAccommodation,
    },
    { label: "Parkolóhely igény", fieldKey: "needParkingSpace", type: "boolean" },
    {
        label: "Parkolóhely igény száma",
        fieldKey: "needParkingSpaceNumber",
        type: "number",
        condition: (event) => !!event.needParkingSpace,
    },
    { label: "Keletkező hulladék?", fieldKey: "producesTrash", type: "boolean" },
    { label: "Hulladék szállítója", fieldKey: "producesTrashDelivery", condition: (event) => !!event.producesTrash },
    {
        label: "Hulladék szállítója",
        fieldKey: "producesTrashDeliveryWhoDelivers",
        condition: (event) => event.producesTrashDelivery === "other",
    },
    { label: "Szükséges internetkapcsolat", fieldKey: "needWifi", type: "boolean" },
    { label: "Szükséges oktatástechnikai támogatás", fieldKey: "needEducationalTechnology", type: "boolean" },
    {
        label: "Oktatástechnikai eszközigény",
        fieldKey: "needEducationalTechnologyItems",
        condition: (event) => !!event.needEducationalTechnology,
    },
    { label: "Korlátozott mozgású személyek részt vesznek", fieldKey: "participantsWithReducedMobility", type: "boolean" },
    { label: "Fotó és/vagy videó készül", fieldKey: "willBePhotos", type: "boolean" },
    { label: "Milyen eszközzel történik", fieldKey: "willBePhotosDevice", condition: (event) => !!event.willBePhotos },
    { label: "Catering", fieldKey: "needCatering", type: "boolean" },
    { label: "Catering típus", fieldKey: "needCateringType", type: "checkbox", condition: (event) => !!event.needCatering },
    { label: "Építési és bontási munkálatok", fieldKey: "willBeConstruction", type: "boolean" },
    {
        label: "Terület igénybevételének kezdése",
        fieldKey: "constructionStartDate",
        type: "datetime-local",
        condition: (event) => !!event.willBeConstruction,
    },
    {
        label: "Terület igénybevételének vége",
        fieldKey: "constructionEndDate",
        type: "datetime-local",
        condition: (event) => !!event.willBeConstruction,
    },
    { label: "Megjelenő alvállalkozók", fieldKey: "constructionSubcontractors", condition: (event) => !!event.willBeConstruction },
    { label: "Magasban végzett tevékenység", fieldKey: "constructionInHeights", condition: (event) => !!event.willBeConstruction },
    {
        label: "Szükséges állvány",
        fieldKey: "constructionNeedScaffolding",
        type: "boolean",
        condition: (event) => !!event.willBeConstruction,
    },
    {
        label: "Kézi anyagmozgatás",
        fieldKey: "constructionManualMaterialHandling",
        type: "boolean",
        condition: (event) => !!event.willBeConstruction,
    },
    {
        label: "Gépi anyagmozgatás",
        fieldKey: "constructionMechanicalMaterialHandling",
        type: "boolean",
        condition: (event) => !!event.willBeConstruction,
    },
    {
        label: "Gépi anyagmozgatás eszközei",
        fieldKey: "constructionMechanicalMaschines",
        type: "checkbox",
        condition: (event) => !!event.willBeConstruction && !!event.constructionMechanicalMaterialHandling,
    },
    {
        label: "Gépi anyagmozgatás egyéb eszközei",
        fieldKey: "constructionMechanicalMaschinesOthers",
        condition: (event) => !!event.willBeConstruction && event.constructionMechanicalMaschines === "other",
    },
    { label: "Takarítás szükséges a rendezvény előtt", fieldKey: "needCleaningBefore", type: "boolean" },
    { label: "Takarítás szükséges a rendezvény alatt", fieldKey: "needCleaningDuringEvent", type: "boolean" },
    { label: "Szükséges villanyszerelői ügyelet", fieldKey: "needElectricians", type: "checkbox" },
    { label: "Szükséges rendezvényszekrényből áram vételezése", fieldKey: "needElectricityFromCabinet", type: "boolean" },
    { label: "Áramigény", fieldKey: "needElectricityFromCabinetNumber", condition: (event) => !!event.needElectricityFromCabinet },
    { label: "Tűzveszélyes tevékenység várható", fieldKey: "fireHazardExpected", type: "boolean" },
    {
        label: "Tűzveszélyes tevékenység várható - leírás",
        fieldKey: "fireHazardExpectedDescription",
        condition: (event) => !!event.fireHazardExpected,
    },
    { label: "Por, füst, pára várható", fieldKey: "expectedDustSmokeVapor", type: "checkbox" },
    { label: "Vegyi anyag felhasználása várható", fieldKey: "expectedUsageOfChemicals", type: "boolean" },
    {
        label: "Vegyi anyag felhasználása várható - leírás",
        fieldKey: "expectedUsageOfChemicalsDescription",
        condition: (event) => !!event.expectedUsageOfChemicals,
    },
    { label: "Díszlet várható", fieldKey: "expectedDecor", type: "boolean" },
];

export const datasheetOrganierDataConfig: FieldConfig[] = [
    { label: "Teljes név", fieldKey: "organizerFullName" },
    { label: "Lakcím", fieldKey: "organizerAddress" },
    { label: "Telefonszám", fieldKey: "organizerPhone", type: "tel" },
    { label: "E-mail cím", fieldKey: "organizerEmail", type: "email" },
];

export const datasheetSecondOrganierDataConfig: FieldConfig[] = [
    { label: "Teljes név", fieldKey: "secondOrganizerFullName" },
    { label: "Lakcím", fieldKey: "secondOrganizerAddress" },
    { label: "Telefonszám", fieldKey: "secondOrganizerPhone", type: "tel" },
    { label: "E-mail cím", fieldKey: "secondOrganizerEmail", type: "email" },
];

export const datasheetCustomerWithLegalBackgroundDataConfig: FieldConfig[] = [
    { label: "Név", fieldKey: "customerWithLegalBackgroundName" },
    { label: "Cím", fieldKey: "customerWithLegalBackgroundAddress" },
    { label: "Adoszám", fieldKey: "customerWithLegalBackgroundTaxNumber" },
    { label: "Telefonszám", fieldKey: "customerWithLegalBackgroundPhone", type: "tel" },
    { label: "E-mail cím", fieldKey: "customerWithLegalBackgroundEmail", type: "email" },
];

export const eventSections = [
    { title: "Rendezvény adatai:", config: datasheetBaseDataConfig },
    { title: "Rendezvény részletes adatai:", config: datasheetDetailsDataConfig },
    { title: "Szervező adatai:", config: datasheetOrganierDataConfig },
    { title: "Másodlagos szervező adatai:", config: datasheetSecondOrganierDataConfig },
    { title: "Cég adatai:", config: datasheetCustomerWithLegalBackgroundDataConfig },
];
