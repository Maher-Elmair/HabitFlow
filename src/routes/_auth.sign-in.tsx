import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "@/_auth/forms/AuthForm";

export const Route = createFileRoute("/_auth/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in — HabitFlow" },
      {
        name: "description",
        content: "Sign in to HabitFlow to track your habits and streaks.",
      },
      { property: "og:title", content: "Sign in — HabitFlow" },
      {
        property: "og:description",
        content: "Sign in to HabitFlow to track your habits and streaks.",
      },
    ],
  }),
  component: AuthForm,
});
