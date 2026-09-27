import { createFileRoute } from "@tanstack/react-router";
import Home from "@/_root/pages/Home";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Today's habits — HabitFlow" },
      {
        name: "description",
        content: "See today's habits, tick them off and keep your streaks alive.",
      },
      { property: "og:title", content: "Today's habits — HabitFlow" },
      {
        property: "og:description",
        content: "See today's habits, tick them off and keep your streaks alive.",
      },
    ],
  }),
  component: Home,
});
