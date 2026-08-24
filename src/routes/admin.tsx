import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobCard } from "@/components/JobCard";
import { dbJobToJob, type Job } from "@/lib/jobs";
import { useRequireRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin approvals — KochiWorks" },
      {
        name: "description",
        content: "Review and approve job postings before they go live to Ernakulam job seekers.",
      },
      { property: "og:title", content: "Admin approvals — KochiWorks" },
      {
        property: "og:description",
        content: "Moderation queue for HR-submitted openings across Ernakulam.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const authorized = useRequireRole(["admin"]);
  const queryClient = useQueryClient();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const { data: pendingJobs = [], isPending: queuePending } = useQuery({
    queryKey: ["adminJobs", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data.map(dbJobToJob);
    },
  });

  const { data: liveJobs = [], isPending: livePending } = useQuery({
    queryKey: ["adminJobs", "approved"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(dbJobToJob);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [liveJobs, hrAccounts, seekers] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "hr"),
        supabase
          .from("user_roles")
          .select("*", { count: "exact", head: true })
          .eq("role", "seeker"),
      ]);
      return {
        liveJobs: liveJobs.count ?? 0,
        hrAccounts: hrAccounts.count ?? 0,
        seekers: seekers.count ?? 0,
      };
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, { status }) => {
      toast.success(status === "approved" ? "Job approved" : "Job rejected");
      queryClient.invalidateQueries({ queryKey: ["adminJobs", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["adminJobs", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Job deleted");
      setJobToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["adminJobs", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["adminJobs", "approved"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!authorized) return null;

  const statCards = [
    { label: "Pending review", value: pendingJobs.length },
    { label: "Live jobs", value: stats?.liveJobs ?? "—" },
    { label: "HR accounts", value: stats?.hrAccounts ?? "—" },
    { label: "Seekers", value: stats?.seekers ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Approval queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Nothing reaches job seekers until you approve it.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {queuePending ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {pendingJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              action={
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={setStatus.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStatus.mutate({ id: job.id, status: "rejected" });
                    }}
                  >
                    <X className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={setStatus.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setStatus.mutate({ id: job.id, status: "approved" });
                    }}
                  >
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deleteJob.isPending}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setJobToDelete(job);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}
      {!queuePending && pendingJobs.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Queue is clear. </p>
      )}

      <h2 className="mt-12 font-display text-xl font-bold sm:text-2xl">Live jobs</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Already approved and visible to job seekers — remove anything fake or reported here.
      </p>

      {livePending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {liveJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={deleteJob.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setJobToDelete(job);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              }
            />
          ))}
        </div>
      )}
      {!livePending && liveJobs.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No live jobs yet.</p>
      )}

      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              {jobToDelete && (
                <>
                  This permanently removes <strong>{jobToDelete.title}</strong> at{" "}
                  {jobToDelete.company}, along with any applications against it. This can't be
                  undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteJob.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (jobToDelete) deleteJob.mutate(jobToDelete.id);
              }}
            >
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
