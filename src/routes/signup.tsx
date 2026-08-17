import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";
import type { Role } from "@/lib/auth";

const ROLES: Role[] = ["seeker", "hr", "admin"];

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>): { role: Role } => ({
    role: ROLES.includes(search.role as Role) ? (search.role as Role) : "seeker",
  }),
  head: () => ({
    meta: [
      { title: "Create account — KochiWorks" },
      { name: "description", content: "Create a KochiWorks account as a job seeker, HR employer or admin." },
      { property: "og:title", content: "Create account — KochiWorks" },
      { property: "og:description", content: "Join KochiWorks in under a minute." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { role } = Route.useSearch();
  return <AuthForm mode="signup" role={role} />;
}
