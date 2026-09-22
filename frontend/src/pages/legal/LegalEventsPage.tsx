import EventsPageContent from "../../components/EventsPageContent";

interface LegalEventsPageProps {
    routePrefix?: string;
}

const LegalEventsPage = ({ routePrefix = "" }: LegalEventsPageProps) => {
    return <EventsPageContent datasheetPathPrefix={routePrefix} />;
};

export default LegalEventsPage;
