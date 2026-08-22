import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "seeker" | "hr" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  seeker: "Job seeker",
  hr: "HR / Employer",
  admin: "Admin",
};

function useRoleQuery() {
  const session = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ["role", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .single();
      if (error) throw error;
      return data.role;
    },
    enabled: !!userId,
  });
}

export function useRole() {
  const session = useSession();
  const { data } = useRoleQuery();
  return session ? (data ?? null) : null;
}

/** Redirects to /login unless the signed-in user's real (DB-verified) role is in `allowed`.
 * Returns true once access is confirmed, so callers can gate rendering until then. */
export function useRequireRole(allowed: Role[]) {
  const navigate = useNavigate();
  const { session, resolved } = useSessionState();
  const { data: role, isPending } = useRoleQuery();

  const authorized = resolved && !!session && !isPending && !!role && allowed.includes(role);

  useEffect(() => {
    if (!resolved) return;
    if (!session || (!isPending && !authorized)) {
      navigate({ to: "/login", replace: true });
    }
  }, [resolved, session, isPending, authorized, navigate]);

  return authorized;
}

function useSessionState() {
  const [state, setState] = useState<{ session: Session | null; resolved: boolean }>({
    session: null,
    resolved: false,
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setState({ session: s, resolved: true }),
    );
    supabase.auth
      .getSession()
      .then(({ data: d }) => setState({ session: d.session, resolved: true }));
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}

export function useSession() {
  return useSessionState().session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
