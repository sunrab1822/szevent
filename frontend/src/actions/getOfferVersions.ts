import type { OfferType, OfferVersion } from "../entitys/Offer";
import { SetOfferVersions } from "../redux/action/offer/setOfferVersions";
import { store } from "../redux/store";

const normalizeVersion = (raw: Record<string, unknown>): OfferVersion => {
    const offers = Array.isArray(raw.offers) ? raw.offers : [];
    const current = typeof raw.current === "boolean" ? raw.current : offers.some((offer) => Number(offer.current) === 1);
    const reason =
        raw.reason ??
        raw.offer_reason ??
        raw.modify_reason ??
        raw.modification_reason ??
        raw.reject_reason;
    const comment = raw.comment ?? raw.note ?? raw.remark ?? raw.description;

    return {
        id: Number(raw.id),
        version: Number(raw.version),
        reason: typeof reason === "string" && reason.trim().length > 0 ? reason : null,
        comment: typeof comment === "string" && comment.trim().length > 0 ? comment : null,
        offer_type: raw.offer_type as OfferType,
        created_at: typeof raw.created_at === "string" ? raw.created_at : undefined,
        updated_at: typeof raw.updated_at === "string" ? raw.updated_at : undefined,
        current,
        offers,
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const fetchOfferVersions = async (eventId: number, offerType: OfferType): Promise<OfferVersion[] | false> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/versions/${eventId}/${offerType}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem(`${import.meta.env.VITE_AUTH_TOKEN}`)}`,
            "Content-Type": "application/json",
        },
        method: "GET",
    });

    if (!response.ok) {
        return false;
    }

    const body = await response.json();
    const rawVersions = Array.isArray(body)
        ? body
        : isRecord(body) && Array.isArray(body.versions)
          ? body.versions
          : isRecord(body) && Array.isArray(body.data)
            ? body.data
            : [];

    return rawVersions.filter(isRecord).map(normalizeVersion);
};

export const getOfferVersions = async (eventId: number, offerType: OfferType): Promise<OfferVersion[] | false> => {
    const versions = await fetchOfferVersions(eventId, offerType);

    if (!versions) {
        return false;
    }

    store.dispatch(SetOfferVersions({ eventId, offerType, versions }));

    return versions;
};
