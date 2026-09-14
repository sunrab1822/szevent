import type { LoaderFunctionArgs } from "react-router-dom";
import type { OfferType, OfferVersion } from "../entitys/Offer";
import { fetchOfferVersion, getOfferVersion } from "../actions/getOfferVersion";
import { fetchOfferVersions, getOfferVersions } from "../actions/getOfferVersions";

const getVisibleVersion = (versions: OfferVersion[]): OfferVersion | null => {
    const currentVersion = versions.find((version) => version.current);
    if (currentVersion) return currentVersion;

    return versions.reduce(
        (latest, version) => (latest === null || version.version > latest.version ? version : latest),
        null as OfferVersion | null
    );
};

export const offerReviewPageLoader = async ({ params }: LoaderFunctionArgs) => {
    const eventId = Number(params.eventId);
    const versionId = Number(params.versionId);
    const offerType = params.offerType as OfferType;
    let relatedFamulusVersion: OfferVersion | null = null;

    if (!Number.isNaN(eventId) && offerType) {
        await getOfferVersions(eventId, offerType);

        if (offerType === "uni") {
            const famulusVersions = await fetchOfferVersions(eventId, "famulus");
            const visibleFamulusVersion = famulusVersions ? getVisibleVersion(famulusVersions) : null;

            if (visibleFamulusVersion) {
                const detailedFamulusVersion = await fetchOfferVersion(visibleFamulusVersion.id);
                relatedFamulusVersion = detailedFamulusVersion || visibleFamulusVersion;
            }
        }
    }

    if (!Number.isNaN(versionId)) {
        await getOfferVersion(versionId);
    }

    return { relatedFamulusVersion };
};
