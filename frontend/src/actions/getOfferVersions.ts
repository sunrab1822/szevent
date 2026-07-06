import type { OfferType, OfferVersion } from "../entitys/Offer";
import { SetOfferVersions } from "../redux/action/offer/setOfferVersions";
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

export const getOfferVersions = async (eventId: number, offerType: OfferType): Promise<OfferVersion[] | false> => {
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
    const rawVersions = Array.isArray(body) ? body : Array.isArray(body.versions) ? body.versions : Array.isArray(body.data) ? body.data : [];
    const versions = rawVersions.map(normalizeVersion);

    store.dispatch(SetOfferVersions({ eventId, offerType, versions }));

    return versions;
};
