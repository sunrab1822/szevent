import type { OfferVersion } from "../entitys/Offer";
import { SetSelectedOfferVersion } from "../redux/action/offer/setSelectedOfferVersion";
import { store } from "../redux/store";

const normalizeVersion = (raw: any): OfferVersion => {
    const offers = Array.isArray(raw.offers) ? raw.offers : [];
    const current = typeof raw.current === "boolean" ? raw.current : offers.some((offer: any) => Number(offer.current) === 1);

    return {
        id: Number(raw.id),
        version: Number(raw.version),
        reason: raw.reason ?? null,
        offer_type: raw.offer_type,
        created_at: raw.created_at,
        updated_at: raw.updated_at,
        current,
        offers,
    };
};

export const getOfferVersion = async (versionId: number): Promise<OfferVersion | false> => {
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
    const version = normalizeVersion(body);

    store.dispatch(SetSelectedOfferVersion({ selectedVersion: version }));

    return version;
};
