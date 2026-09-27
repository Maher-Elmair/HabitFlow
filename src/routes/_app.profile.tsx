import { createFileRoute } from "@tanstack/react-router";
import Profile from "@/_root/pages/Profile";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — HabitFlow" },
      {
        name: "description",
        content: "Manage your account, habits and preferences in HabitFlow.",
      },
      { property: "og:title", content: "Profile — HabitFlow" },
      {
        property: "og:description",
        content: "Manage your account, habits and preferences in HabitFlow.",
      },
    ],
  }),
  component: Profile,
});
