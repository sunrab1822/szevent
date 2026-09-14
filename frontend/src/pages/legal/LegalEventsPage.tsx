import EventsListColumn from "../../components/EventsListColumn";
import { useSelector } from "../../redux/store";

interface LegalEventsPageProps {
    routePrefix?: string;
}

const LegalEventsPage = ({ routePrefix = "" }: LegalEventsPageProps) => {
    const { submittedEvents, offerEvents, inProgressEvents, settlementEvents } = useSelector((state) => state.event);

    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EventsListColumn name="Beérkezett" color="#50adc9" events={submittedEvents} datasheetPathPrefix={routePrefix} />
            <EventsListColumn name="Árajánlat készítés" color="#8b500e" events={offerEvents} datasheetPathPrefix={routePrefix} />
            <EventsListColumn name="Megvalósítás" color="#00677e" events={inProgressEvents} datasheetPathPrefix={routePrefix} />
            <EventsListColumn name="Elszámolás" color="#bec8cd" events={settlementEvents} datasheetPathPrefix={routePrefix} />
        </div>
    );
};

export default LegalEventsPage;
