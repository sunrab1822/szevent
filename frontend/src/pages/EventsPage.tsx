import EventsListColumn from "../components/EventsListColumn";
import { useSelector } from "../redux/store";

const EventsPage = () => {
    const { submittedEvents, offerEvents, inProgressEvents, settlementEvents } = useSelector((state) => state.event);
    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <EventsListColumn name="Beérkezett" color="#50adc9" events={submittedEvents} />
            <EventsListColumn name="Árajánlat készítés" color="#8b500e" events={offerEvents} />
            <EventsListColumn name="Megvalósítás" color="#00677e" events={inProgressEvents} />
            <EventsListColumn name="Elszámolás" color="#bec8cd" events={settlementEvents} />
        </div>
    );
};

export default EventsPage;
