import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "@/_auth/forms/AuthForm";

export const Route = createFileRoute("/_auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Create your account — HabitFlow" },
      {
        name: "description",
        content: "Create a free HabitFlow account and start building better habits.",
      },
      { property: "og:title", content: "Create your account — HabitFlow" },
      {
        property: "og:description",
        content: "Create a free HabitFlow account and start building better habits.",
      },
    ],
  }),
  component: AuthForm,
});
