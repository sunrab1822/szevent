import type { OfferType, OfferVersion } from "../entitys/Offer";
import { SetSelectedOfferVersion } from "../redux/action/offer/setSelectedOfferVersion";
import { store } from "../redux/store";

const getReason = (raw: Record<string, unknown>): string | null => {
    const value =
        raw.reason ??
        raw.offer_reason ??
        raw.modify_reason ??
        raw.modification_reason ??
        raw.reject_reason;
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const getComment = (raw: Record<string, unknown>): string | null => {
    const value = raw.comment ?? raw.note ?? raw.remark ?? raw.description;
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeVersion = (raw: Record<string, unknown>): OfferVersion => {
    const offers = Array.isArray(raw.offers) ? raw.offers : [];
    const current = typeof raw.current === "boolean" ? raw.current : offers.some((offer) => Number(offer.current) === 1);

    return {
        id: Number(raw.id),
        version: Number(raw.version),
        reason: getReason(raw),
        comment: getComment(raw),
        offer_type: raw.offer_type as OfferType,
        created_at: typeof raw.created_at === "string" ? raw.created_at : undefined,
        updated_at: typeof raw.updated_at === "string" ? raw.updated_at : undefined,
        current,
        offers,
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

export const fetchOfferVersion = async (versionId: number): Promise<OfferVersion | false> => {
    const response = await fetch(`${import.meta.env.VITE_API_ORIGIN}/api/version/${versionId}`, {
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
    const rawVersion = isRecord(body) && isRecord(body.version) ? body.version : body;

    if (!isRecord(rawVersion)) {
        return false;
    }

    const version = normalizeVersion(rawVersion);

    return version;
};

export const getOfferVersion = async (versionId: number): Promise<OfferVersion | false> => {
    const version = await fetchOfferVersion(versionId);

    if (!version) {
        return false;
    }

    store.dispatch(SetSelectedOfferVersion({ selectedVersion: version }));

    return version;
};
