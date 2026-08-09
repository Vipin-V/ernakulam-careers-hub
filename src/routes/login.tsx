import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setRole, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — KochiWorks" },
      {
        name: "description",
        content: "Sign in to KochiWorks as a job seeker, HR employer or admin in Ernakulam.",
      },
      { property: "og:title", content: "Sign in — KochiWorks" },
      { property: "og:description", content: "Separate access for seekers, HR teams and admins." },
    ],
  }),
  component: LoginPage,
});

const ROLES: { id: Role; label: string; hint: string; icon: typeof User; to: string }[] = [
  { id: "seeker", label: "Job seeker", hint: "Apply and track status", icon: User, to: "/" },
  { id: "hr", label: "HR / Employer", hint: "Post jobs, view applicants", icon: Briefcase, to: "/post" },
  { id: "admin", label: "Admin", hint: "Approve postings", icon: ShieldCheck, to: "/admin" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("seeker");
  const active = ROLES.find((r) => r.id === selected)!;

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose how you want to continue.</p>

      <div className="mt-6 grid gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
              selected === r.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                selected === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <r.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{r.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{r.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <form
        className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          setRole(selected);
          navigate({ to: active.to });
        }}
      >
        <div className="grid gap-2">
          <Label>Phone or email</Label>
          <Input placeholder="you@example.com" />
        </div>
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" size="lg" className="rounded-xl">
          Continue as {active.label}
        </Button>
      </form>
    </div>
  );
}
