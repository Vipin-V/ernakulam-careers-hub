import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, FileText, Loader2, Star, Trophy } from "lucide-react";
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

type PendingAction = { id: string; status: "Shortlisted" | "Selected"; applicantName: string };

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

function ApplicantCard({
  applicant,
  showJobTitle,
  busy,
  onShortlist,
  onSelect,
  onNotSelected,
}: {
  applicant: ApplicantRow;
  showJobTitle: boolean;
  busy: boolean;
  onShortlist: () => void;
  onSelect: () => void;
  onNotSelected: () => void;
}) {
  const a = applicant;
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{a.applicant_name}</h2>
          {showJobTitle && <p className="truncate text-sm text-muted-foreground">{a.jobs.title}</p>}
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
          disabled={busy || a.status === "Shortlisted"}
          onClick={onShortlist}
        >
          Shortlist
        </Button>
        <Button
          size="sm"
          className="h-10 rounded-full"
          disabled={busy || a.status === "Selected"}
          onClick={onSelect}
        >
          Select
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-10 rounded-full"
          disabled={busy || a.status === "Not selected"}
          onClick={onNotSelected}
        >
          Not selected
        </Button>
      </div>
    </article>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  count,
  accentClassName,
}: {
  icon: typeof Star;
  label: string;
  count: number;
  accentClassName: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${accentClassName}`}>
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="font-display text-lg font-semibold">{label}</h2>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function ApplicantsPage() {
  const authorized = useRequireRole(["hr"]);
  const queryClient = useQueryClient();
  const [jobFilter, setJobFilter] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

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
      setPendingAction(null);
      queryClient.invalidateQueries({ queryKey: ["myApplicants"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!authorized) return null;

  const jobTitles = [...new Set(applicants.map((a) => a.jobs.title))];
  const list = jobFilter ? applicants.filter((a) => a.jobs.title === jobFilter) : applicants;

  const shortlisted = list.filter((a) => a.status === "Shortlisted");
  const selected = list.filter((a) => a.status === "Selected");
  const others = list.filter((a) => a.status !== "Shortlisted" && a.status !== "Selected");

  const cardProps = (a: ApplicantRow, showJobTitle: boolean) => ({
    applicant: a,
    showJobTitle,
    busy: setStatus.isPending,
    onShortlist: () => setPendingAction({ id: a.id, status: "Shortlisted", applicantName: a.applicant_name }),
    onSelect: () => setPendingAction({ id: a.id, status: "Selected", applicantName: a.applicant_name }),
    onNotSelected: () => setStatus.mutate({ id: a.id, status: "Not selected" }),
  });

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
              <span className="ml-1.5 opacity-70">
                {applicants.filter((a) => a.jobs.title === j).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {isPending && (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {!isPending && jobFilter && (
        <div className="mt-8 grid gap-10">
          <section>
            <SectionHeader
              icon={Star}
              label="Shortlisted"
              count={shortlisted.length}
              accentClassName="bg-secondary text-secondary-foreground"
            />
            {shortlisted.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {shortlisted.map((a) => (
                  <ApplicantCard key={a.id} {...cardProps(a, false)} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No one shortlisted yet.</p>
            )}
          </section>

          <section>
            <SectionHeader
              icon={Trophy}
              label="Selected"
              count={selected.length}
              accentClassName="bg-primary/10 text-primary"
            />
            {selected.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {selected.map((a) => (
                  <ApplicantCard key={a.id} {...cardProps(a, false)} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No one selected yet.</p>
            )}
          </section>

          {others.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Other applicants
              </h2>
              <div className="mt-4 grid gap-4">
                {others.map((a) => (
                  <ApplicantCard key={a.id} {...cardProps(a, false)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!isPending && !jobFilter && (
        <div className="mt-6 grid gap-4">
          {list.map((a) => (
            <ApplicantCard key={a.id} {...cardProps(a, true)} />
          ))}
        </div>
      )}

      {!isPending && list.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">No applicants yet.</p>
      )}

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.status === "Shortlisted" ? "Shortlist" : "Select"} this applicant?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction && (
                <>
                  Mark <strong>{pendingAction.applicantName}</strong> as{" "}
                  {pendingAction.status === "Shortlisted" ? "shortlisted" : "selected"}?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={setStatus.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingAction) setStatus.mutate(pendingAction);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
