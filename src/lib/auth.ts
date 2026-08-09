import { useEffect, useState } from "react";

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
