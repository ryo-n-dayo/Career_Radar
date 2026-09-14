import { EventBrowser } from "@/features/events/components/EventBrowser";
import { getEvents } from "@/features/events/server/getEvents";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const initialEvents = await getEvents();
  return <EventBrowser initialEvents={initialEvents} />;
}
