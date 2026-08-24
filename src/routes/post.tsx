import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Building2, FileCheck2 } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { JOB_TYPES, AREAS, dbJobToJob, type JobType } from "@/lib/jobs";
import { useRequireRole, useSession, useCompany } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a job — KochiWorks HR" },
      {
        name: "description",
        content: "HR teams in Ernakulam can post openings and track approval status.",
      },
      { property: "og:title", content: "Post a job — KochiWorks HR" },
      {
        property: "og:description",
        content: "Publish part-time, catering, event and internship roles across Ernakulam.",
      },
    ],
  }),
  component: PostPage,
});

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Awaiting approval", className: "bg-secondary text-secondary-foreground" },
  approved: { label: "Live", className: "bg-primary/10 text-primary" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
};

function PostPage() {
  const authorized = useRequireRole(["hr"]);
  const session = useSession();
  const userId = session?.user.id;
  const company = useCompany();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<JobType>(JOB_TYPES[0]!);
  const [area, setArea] = useState(AREAS[0]!);
  const [pay, setPay] = useState("");
  const [openings, setOpenings] = useState("1");
  const [shift, setShift] = useState("");
  const [contact, setContact] = useState("");
  const [about, setAbout] = useState("");
  const [requiresResume, setRequiresResume] = useState(false);

  const { data: myJobs = [], isPending: jobsPending } = useQuery({
    queryKey: ["myJobs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(dbJobToJob);
    },
    enabled: !!userId,
  });

  const submitJob = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("jobs").insert({
        title,
        company: company!,
        type,
        area,
        pay,
        openings: Number(openings) || 1,
        shift,
        contact,
        about,
        posted_by: userId!,
        requires_resume: requiresResume,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Submitted for approval");
      setTitle("");
      setPay("");
      setOpenings("1");
      setShift("");
      setContact("");
      setAbout("");
      setRequiresResume(false);
      queryClient.invalidateQueries({ queryKey: ["myJobs", userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!authorized) return null;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Post an opportunity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions go to an admin for approval before job seekers see them.
        </p>

        <form
          className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            submitJob.mutate();
          }}
        >
          <Field label="Job title">
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Catering staff for wedding"
            />
          </Field>
          <Field label="Company / organiser">
            <div className="flex h-9 items-center gap-2 rounded-md border border-dashed border-input bg-muted/40 px-3 text-sm text-foreground">
              <Building2 className="h-4 w-4 shrink-0 text-primary" />
              {company ?? "Loading your registered company…"}
            </div>
            <p className="text-xs text-muted-foreground">
              From your HR registration — can't be edited here.
            </p>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job type">
              <Select value={type} onChange={(v) => setType(v as JobType)} options={JOB_TYPES} />
            </Field>
            <Field label="Area in Ernakulam">
              <Select value={area} onChange={setArea} options={AREAS} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pay">
              <Input
                required
                value={pay}
                onChange={(e) => setPay(e.target.value)}
                placeholder="₹1,200 / day"
              />
            </Field>
            <Field label="Openings">
              <Input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                placeholder="5"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Shift timing">
              <Input
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                placeholder="9 AM – 6 PM"
              />
            </Field>
            <Field label="Contact">
              <Input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or email"
              />
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              rows={5}
              required
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Timings, requirements, contact details…"
            />
          </Field>
          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <Switch
              checked={requiresResume}
              onCheckedChange={setRequiresResume}
              className="mt-0.5"
            />
            <span className="grid gap-0.5">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                <FileCheck2 className="h-4 w-4 text-primary" />
                Require CV / resume to apply
              </span>
              <span className="text-xs text-muted-foreground">
                Job seekers must attach a resume before they can submit an application.
              </span>
            </span>
          </label>
          <Button
            type="submit"
            size="lg"
            disabled={submitJob.isPending || !company}
            className="rounded-xl justify-self-start"
          >
            {submitJob.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit for approval
          </Button>
        </form>
      </section>

      <aside>
        <h2 className="font-display text-lg font-semibold">Your postings</h2>
        <div className="mt-4 grid gap-4">
          {jobsPending &&
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          {!jobsPending &&
            myJobs.map((job) => {
              const meta = STATUS_META[job.status]!;
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  action={
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  }
                />
              );
            })}
          {!jobsPending && myJobs.length === 0 && (
            <p className="text-sm text-muted-foreground">You haven't posted anything yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
