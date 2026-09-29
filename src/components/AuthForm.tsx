import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, ShieldCheck, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const ROLE_META: Record<
  Role,
  { label: string; hint: string; icon: typeof User; to: string }
> = {
  seeker: { label: "Job seeker", hint: "Apply and track status", icon: User, to: "/jobs" },
  hr: { label: "HR / Employer", hint: "Post jobs, view applicants", icon: Briefcase, to: "/post" },
  admin: { label: "Admin", hint: "Approve postings", icon: ShieldCheck, to: "/admin" },
};

export function AuthForm({ mode, role }: { mode: "signin" | "signup"; role: Role }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const meta = ROLE_META[role];
  const Icon = meta.icon;
  const isHrSignup = mode === "signup" && role === "hr";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = company.trim();
    if (isHrSignup && !trimmedCompany) {
      toast.error("Company / organization name is required");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: isHrSignup ? { role, company: trimmedCompany } : { role },
          },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your email to confirm your account.");
          return;
        }
        if (isHrSignup) {
          const { error: companyError } = await supabase.rpc("set_own_company", {
            _company: trimmedCompany,
          });
          if (companyError) throw companyError;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: meta.to });
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

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{meta.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{meta.hint}</span>
        </span>
        <Link to="/login" className="shrink-0 text-xs font-medium text-primary hover:underline">
          Change
        </Link>
      </div>

      <form
        className="mt-5 grid gap-4 rounded-2xl border border-border bg-card p-5"
        onSubmit={submit}
      >
        {isHrSignup && (
          <div className="grid gap-2">
            <Label htmlFor="company">Company / organization</Label>
            <Input
              id="company"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Malabar Caterers"
            />
            <p className="text-xs text-muted-foreground">
              Shown on every job you post — it can't be changed per listing.
            </p>
          </div>
        )}
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
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="rounded-xl" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Sign up"}
        </Button>
      </form>

      {role !== "admin" && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to KochiWorks?" : "Already have an account?"}{" "}
          <Link
            to={mode === "signin" ? "/signup" : "/signin"}
            search={{ role }}
            className="font-medium text-primary hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </Link>
        </p>
      )}
    </div>
  );
}
