import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, ShieldCheck, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setRole, type Role } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — KochiWorks" },
      {
        name: "description",
        content: "Sign in or create a KochiWorks account as a job seeker, HR employer or admin.",
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const active = ROLES.find((r) => r.id === selected)!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { role: selected },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setRole(selected);
      navigate({ to: active.to });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose how you want to continue.</p>

      <div className="mt-6 grid gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
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

      <form className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5" onSubmit={submit}>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? `Sign in as ${active.label}` : `Sign up as ${active.label}`}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New to KochiWorks?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="font-medium text-primary hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
