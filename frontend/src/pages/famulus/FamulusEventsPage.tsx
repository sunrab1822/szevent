import EventsPageContent from "../../components/EventsPageContent";

interface FamulusEventsPageProps {
    routePrefix?: string;
}

const FamulusEventsPage = ({ routePrefix = "" }: FamulusEventsPageProps) => {
    return <EventsPageContent datasheetPathPrefix={routePrefix} />;
};

export default FamulusEventsPage;
