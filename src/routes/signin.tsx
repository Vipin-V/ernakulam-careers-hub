import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
import type { Role } from "@/lib/auth";

const ROLES: Role[] = ["seeker", "hr", "admin"];

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): { role: Role } => ({
    role: ROLES.includes(search['role'] as Role) ? (search['role'] as Role) : "seeker",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — KochiWorks" },
      { name: "description", content: "Sign in to your KochiWorks account to find or post jobs in Ernakulam." },
      { property: "og:title", content: "Sign in — KochiWorks" },
      { property: "og:description", content: "Access your KochiWorks account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { role } = Route.useSearch();
  return <AuthForm mode="signin" role={role} />;
}
