import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_STYLE, type AppStatus, type DbJob } from "@/lib/jobs";
import { useRequireRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants — KochiWorks HR" },
      {
        name: "description",
        content: "HR teams can review candidate details and update application status.",
      },
      { property: "og:title", content: "Applicants — KochiWorks HR" },
      { property: "og:description", content: "Candidate contact details and application status." },
    ],
  }),
  component: ApplicantsPage,
});

type ApplicantRow = Tables<"applications"> & { jobs: DbJob };

function ResumeLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);

  const open = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    setLoading(false);
    if (error || !data) {
      toast.error("Couldn't open resume");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      className="h-10 rounded-full"
      onClick={open}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      View resume
    </Button>
  );
}

function ApplicantsPage() {
  const authorized = useRequireRole(["hr"]);
  const queryClient = useQueryClient();
  const [jobFilter, setJobFilter] = useState<string | null>(null);

  const { data: applicants = [], isPending } = useQuery({
    queryKey: ["myApplicants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, jobs(*)")
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data as ApplicantRow[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["myApplicants"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!authorized) return null;

  const jobTitles = [...new Set(applicants.map((a) => a.jobs.title))];
  const list = jobFilter ? applicants.filter((a) => a.jobs.title === jobFilter) : applicants;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Applicants</h1>
      <p className="mt-1 text-sm text-muted-foreground">People who applied to your openings.</p>

      {jobTitles.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setJobFilter(null)}
            className={`min-h-10 rounded-full border px-3.5 py-2 text-sm transition-colors ${
              !jobFilter
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            All
          </button>
          {jobTitles.map((j) => (
            <button
              key={j}
              onClick={() => setJobFilter(j)}
              className={`min-h-10 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                jobFilter === j
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        {!isPending &&
          list.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{a.applicant_name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{a.jobs.title}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status as AppStatus]}`}
                >
                  {a.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" /> {a.applicant_phone}
                </span>
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{a.applicant_email}</span>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {a.resume_url && <ResumeLink path={a.resume_url} />}
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-10 rounded-full"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ id: a.id, status: "Shortlisted" })}
                >
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  className="h-10 rounded-full"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ id: a.id, status: "Selected" })}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 rounded-full"
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate({ id: a.id, status: "Not selected" })}
                >
                  Not selected
                </Button>
              </div>
            </article>
          ))}
      </div>
      {!isPending && list.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No applicants yet.</p>
      )}
    </div>
  );
}
