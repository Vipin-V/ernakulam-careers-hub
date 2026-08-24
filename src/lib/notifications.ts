import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./auth";

export type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  to?: string | undefined;
  unread: boolean;
};

export function useNotifications() {
  const session = useSession();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const queryKey = ["notifications", userId];

  const { data: rows = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const items: Notif[] = rows.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
    to: n.link ?? undefined,
    unread: !n.read,
  }));

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId!)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    items,
    unread: items.filter((n) => n.unread).length,
    markRead: (id: string) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
