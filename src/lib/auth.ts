import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "seeker" | "hr" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  seeker: "Job seeker",
  hr: "HR / Employer",
  admin: "Admin",
};

const KEY = "kw-role";
const EVT = "kw-role-change";

export function setRole(role: Role | null) {
  if (role) localStorage.setItem(KEY, role);
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

export function useRole() {
  const [role, setState] = useState<Role | null>(null);

  useEffect(() => {
    const read = () => setState((localStorage.getItem(KEY) as Role | null) ?? null);
    read();
    window.addEventListener(EVT, read);
    return () => window.removeEventListener(EVT, read);
  }, []);

  return role;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data: d }) => setSession(d.session));
    return () => data.subscription.unsubscribe();
  }, []);

  return session;
}

export async function signOut() {
  await supabase.auth.signOut();
  setRole(null);
}
