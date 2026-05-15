import { createFileRoute } from "@tanstack/react-router";
import { RestaurantPOS } from "@/components/pos/RestaurantPOS";

export const Route = createFileRoute("/restaurant")({
  head: () => ({
    meta: [
      { title: "Restaurant Management — Fahari Nexus" },
      { name: "description", content: "Advanced floor management and kitchen display system." },
    ],
  }),
  component: RestaurantPOS,
});
