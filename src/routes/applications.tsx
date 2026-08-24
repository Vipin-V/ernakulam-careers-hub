import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@/components/JobCard";
import { Skeleton } from "@/components/ui/skeleton";
import { dbJobToJob, STATUS_STYLE, type AppStatus, type DbJob } from "@/lib/jobs";
import { useRequireRole, useSession } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My applications — KochiWorks" },
      {
        name: "description",
        content: "Track the status of every job you applied to across Ernakulam.",
      },
      { property: "og:title", content: "My applications — KochiWorks" },
      {
        property: "og:description",
        content: "See if your application is under review or selected.",
      },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const authorized = useRequireRole(["seeker"]);
  const session = useSession();
  const userId = session?.user.id;

  const { data: applications = [], isPending } = useQuery({
    queryKey: ["myApplications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .eq("applicant_id", userId!)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data as (Tables<"applications"> & { jobs: DbJob })[];
    },
    enabled: !!userId,
  });

  if (!authorized) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isPending ? "Loading…" : `${applications.length} applications`} · updates appear here
      </p>

      <div className="mt-6 grid gap-4">
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        {!isPending &&
          applications.map((a) => (
            <div key={a.id} className="grid gap-2">
              <JobCard
                job={dbJobToJob(a.jobs)}
                action={
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status as AppStatus]}`}
                  >
                    {a.status}
                  </span>
                }
              />
              {a.note && <p className="px-1 text-xs text-muted-foreground">{a.note}</p>}
            </div>
          ))}
      </div>
      {!isPending && applications.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          You haven't applied to anything yet.
        </p>
      )}
    </div>
  );
}
