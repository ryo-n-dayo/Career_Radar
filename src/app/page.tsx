import { EventBrowser } from "@/features/events/components/EventBrowser";
import { getEvents } from "@/features/events/server/getEvents";

export const revalidate = 600;

export default async function Home() {
  const initialEvents = await getEvents();
  return <EventBrowser initialEvents={initialEvents} />;
}
