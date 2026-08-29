import { ThreePaneDashboard } from "@/features/dashboard/components/ThreePaneDashboard";
import { getRadarItems } from "@/features/dashboard/server/getRadarItems";

export default async function Home() {
  const initialItems = await getRadarItems();
  return <ThreePaneDashboard initialItems={initialItems} />;
}
