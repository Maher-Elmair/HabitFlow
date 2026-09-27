import { createFileRoute } from "@tanstack/react-router";
import Analytics from "@/_root/pages/Analytics";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — HabitFlow" },
      {
        name: "description",
        content: "Charts and streak insights showing how your habits trend over time.",
      },
      { property: "og:title", content: "Analytics — HabitFlow" },
      {
        property: "og:description",
        content: "Charts and streak insights showing how your habits trend over time.",
      },
    ],
  }),
  component: Analytics,
});
