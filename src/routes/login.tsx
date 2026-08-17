import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ShieldCheck, User, ArrowRight } from "lucide-react";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Choose your role — KochiWorks" },
      {
        name: "description",
        content: "Pick how you want to use KochiWorks: job seeker, HR employer or admin.",
      },
      { property: "og:title", content: "Choose your role — KochiWorks" },
      { property: "og:description", content: "Separate access for seekers, HR teams and admins." },
    ],
  }),
  component: RolePicker,
});

export const ROLES: { id: Role; label: string; hint: string; icon: typeof User; to: string }[] = [
  { id: "seeker", label: "Job seeker", hint: "Apply and track status", icon: User, to: "/" },
  { id: "hr", label: "HR / Employer", hint: "Post jobs, view applicants", icon: Briefcase, to: "/post" },
  { id: "admin", label: "Admin", hint: "Approve postings", icon: ShieldCheck, to: "/admin" },
];

function RolePicker() {
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Continue as</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose your role to sign in or create an account.</p>

      <div className="mt-6 grid gap-3">
        {ROLES.map((r) => (
          <Link
            key={r.id}
            to="/signin"
            search={{ role: r.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
              <r.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{r.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{r.hint}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
