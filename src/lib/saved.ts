import { useEffect, useState } from "react";

const KEY = "kw-saved";
const EVT = "kw-saved-change";

const read = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

export function toggleSaved(id: string) {
  const next = read().includes(id) ? read().filter((x) => x !== id) : [...read(), id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVT));
}

export function useSavedIds() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(read());
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);

  return ids;
}
