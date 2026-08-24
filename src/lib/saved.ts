import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const EVT = "kw-saved-change";
let cache: string[] = [];
let inFlight: Promise<string[]> | null = null;

async function fetchSavedIds(): Promise<string[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) return [];
  const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("user_id", userId);
  if (error) return [];
  return data.map((r) => r.job_id);
}

async function refresh() {
  if (!inFlight) {
    inFlight = fetchSavedIds().finally(() => {
      inFlight = null;
    });
  }
  cache = await inFlight;
  window.dispatchEvent(new Event(EVT));
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange(() => {
    refresh();
  });
}

export async function toggleSaved(id: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) {
    toast.error("Sign in to save jobs");
    return;
  }
  if (cache.includes(id)) {
    await supabase.from("saved_jobs").delete().eq("user_id", userId).eq("job_id", id);
  } else {
    await supabase.from("saved_jobs").insert({ user_id: userId, job_id: id });
  }
  await refresh();
}

export function useSavedIds() {
  const [ids, setIds] = useState<string[]>(cache);

  useEffect(() => {
    const sync = () => setIds(cache);
    refresh().then(sync);
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);

  return ids;
}
