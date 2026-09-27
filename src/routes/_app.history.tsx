import { createFileRoute } from "@tanstack/react-router";
import History from "@/_root/pages/History";

export const Route = createFileRoute("/_app/history")({
  head: () => ({
    meta: [
      { title: "History — HabitFlow" },
      {
        name: "description",
        content: "Browse past days and review how consistently you kept each habit.",
      },
      { property: "og:title", content: "History — HabitFlow" },
      {
        property: "og:description",
        content: "Browse past days and review how consistently you kept each habit.",
      },
    ],
  }),
  component: History,
});
