import type { LoaderFunctionArgs } from "react-router-dom";
import type { OfferType } from "../entitys/Offer";
import { getOfferVersion } from "../actions/getOfferVersion";
import { getOfferVersions } from "../actions/getOfferVersions";

export const offerReviewPageLoader = async ({ params }: LoaderFunctionArgs) => {
    const eventId = Number(params.eventId);
    const versionId = Number(params.versionId);
    const offerType = params.offerType as OfferType;

    if (!Number.isNaN(eventId) && offerType) {
        await getOfferVersions(eventId, offerType);
    }

    if (!Number.isNaN(versionId)) {
        await getOfferVersion(versionId);
    }

    return null;
};
