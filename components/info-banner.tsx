import { getSiteSettings } from "@/lib/events";

/** Bandeau d'information réglé dans l'administration (mis en cache). */
export async function InfoBanner() {
  const { maintenanceMessage } = await getSiteSettings();
  if (!maintenanceMessage) return null;
  return (
    <div role="status" className="bg-forest px-5 py-2 text-center text-sm font-semibold text-cream">
      {maintenanceMessage}
    </div>
  );
}
