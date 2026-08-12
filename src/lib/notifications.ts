import { useCallback, useEffect, useState } from "react";
import type { Role } from "./auth";

export type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  to?: string;
};

const FEED: Record<Role | "guest", Notif[]> = {
  guest: [
    { id: "g1", title: "New catering jobs in Edappally", body: "12 openings posted for the wedding season.", time: "2h ago", to: "/" },
    { id: "g2", title: "Sign in to apply", body: "Create a free account to track your applications.", time: "1d ago", to: "/login" },
  ],
  seeker: [
    { id: "s1", title: "You've been shortlisted", body: "Malabar Caterers shortlisted you for Catering Staff.", time: "20m ago", to: "/applications" },
    { id: "s2", title: "Selected — report Monday", body: "Lulu Fashion Store: report at store on Monday, 4 PM.", time: "3h ago", to: "/applications" },
    { id: "s3", title: "New internship in Kakkanad", body: "Infopark Labs is hiring a Frontend Developer Intern.", time: "1d ago", to: "/jobs/2" },
  ],
  hr: [
    { id: "h1", title: "2 new applicants", body: "Catering Staff — Wedding Season received 2 applications.", time: "15m ago", to: "/applicants" },
    { id: "h2", title: "Job approved", body: "Your post 'Frontend Developer Intern' is now live.", time: "5h ago", to: "/post" },
  ],
  admin: [
    { id: "ad1", title: "3 posts awaiting approval", body: "Review pending job posts from employers.", time: "10m ago", to: "/admin" },
    { id: "ad2", title: "New employer registered", body: "Grand Kochi Hotels joined KochiWorks.", time: "1d ago", to: "/admin" },
  ],
};

const KEY = "kw-notif-read";
const EVT = "kw-notif-change";

const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

export function useNotifications(role: Role | null) {
  const items = FEED[role ?? "guest"];
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setReadIds(read());
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);

  const save = (ids: string[]) => {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(EVT));
  };

  const markRead = useCallback((id: string) => save([...new Set([...read(), id])]), []);
  const markAllRead = useCallback(
    () => save([...new Set([...read(), ...items.map((i) => i.id)])]),
    [items],
  );

  return {
    items: items.map((n) => ({ ...n, unread: !readIds.includes(n.id) })),
    unread: items.filter((n) => !readIds.includes(n.id)).length,
    markRead,
    markAllRead,
  };
}
