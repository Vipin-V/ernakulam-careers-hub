import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Wallet,
  Clock,
  Users,
  CalendarClock,
  Phone,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  FileCheck2,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dbJobToJob, dbJobDetail } from "@/lib/jobs";
import { useSession, useRole } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SaveButton } from "@/components/SaveButton";

export const Route = createFileRoute("/jobs/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();
    if (error || !data) throw notFound();
    return { job: dbJobToJob(data), detail: dbJobDetail(data) };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Job unavailable — KochiWorks" }, { name: "robots", content: "noindex" }],
      };
    const { job } = loaderData;
    const title = `${job.title} at ${job.company} — KochiWorks`;
    const description = `${job.type} role in ${job.area}, Ernakulam · ${job.pay}. Apply on KochiWorks.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: JobDetailPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-xl font-bold">Job not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This opening may have been filled or removed.
      </p>
      <Button asChild className="mt-6 rounded-xl">
        <Link to="/">Browse jobs</Link>
      </Button>
    </div>
  ),
});

function JobDetailPage() {
  const { job, detail } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All jobs
      </Link>

      <header className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              {job.type}
            </Badge>
            {job.requiresResume && (
              <Badge
                variant="outline"
                className="gap-1 rounded-full border-primary/40 text-primary"
              >
                <FileCheck2 className="h-3 w-3" /> CV required
              </Badge>
            )}
          </div>
          <SaveButton id={job.id} />
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">
          {job.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Fact icon={MapPin} label="Location" value={`${job.area}, Ernakulam`} />
          <Fact icon={Wallet} label="Pay" value={job.pay} />
          <Fact
            icon={CalendarClock}
            label="Shift"
            value={detail.shift || "Discussed at interview"}
          />
          <Fact icon={Users} label="Openings" value={`${detail.openings}`} />
          <Fact icon={Clock} label="Posted" value={job.posted} />
          <Fact icon={Phone} label="Contact" value={detail.contact} />
        </dl>
      </header>

      <section className="mt-5 grid gap-5 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            About the job
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{detail.about}</p>
        </div>
        {detail.duties.length > 0 && <List title="What you'll do" items={detail.duties} />}
        {detail.requirements.length > 0 && (
          <List title="Requirements" items={detail.requirements} />
        )}
        {job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.map((t: string) => (
              <span
                key={t}
                className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="sticky bottom-4 mt-6">
        <ApplyButton jobId={job.id} requiresResume={job.requiresResume} />
      </div>
    </div>
  );
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function ApplyButton({ jobId, requiresResume }: { jobId: string; requiresResume: boolean }) {
  const session = useSession();
  const role = useRole();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  const { data: existing, isPending: checkingApplied } = useQuery({
    queryKey: ["myApplication", jobId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("applicant_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && role === "seeker",
  });

  const apply = useMutation({
    mutationFn: async () => {
      let resumeUrl: string | null = null;
      if (requiresResume) {
        if (!resume) throw new Error("Attach your CV/resume to apply for this job");
        const path = `${userId}/${jobId}-${Date.now()}-${resume.name}`;
        const { error: uploadError } = await supabase.storage.from("resumes").upload(path, resume);
        if (uploadError) throw uploadError;
        resumeUrl = path;
      }

      const { error } = await supabase.from("applications").insert({
        job_id: jobId,
        applicant_id: userId!,
        applicant_name: name,
        applicant_phone: phone,
        applicant_email: session!.user.email ?? "",
        resume_url: resumeUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted");
      setOpen(false);
      setResume(null);
      queryClient.invalidateQueries({ queryKey: ["myApplication", jobId, userId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!session) {
    return (
      <Button asChild size="lg" className="w-full rounded-xl shadow-lg">
        <Link to="/login">Sign in to apply</Link>
      </Button>
    );
  }

  if (role !== "seeker") {
    return (
      <Button size="lg" className="w-full rounded-xl shadow-lg" disabled>
        Only job seekers can apply
      </Button>
    );
  }

  if (checkingApplied) {
    return (
      <Button size="lg" className="w-full rounded-xl shadow-lg" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (existing) {
    return (
      <Button size="lg" className="w-full rounded-xl shadow-lg" disabled>
        <CheckCircle2 className="h-4 w-4" /> Applied
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full rounded-xl shadow-lg">
          Apply now
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for this job</DialogTitle>
          <DialogDescription>
            Share your contact details so the employer can reach you.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            apply.mutate();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="apply-name">Your name</Label>
            <Input
              id="apply-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          {requiresResume && (
            <div className="grid gap-2">
              <Label htmlFor="apply-resume">CV / resume</Label>
              <label
                htmlFor="apply-resume"
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-muted/30 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40"
              >
                <Paperclip className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">
                  {resume ? resume.name : "Choose a file (PDF, DOC — up to 5MB)"}
                </span>
              </label>
              <input
                id="apply-resume"
                type="file"
                required
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file && file.size > MAX_RESUME_BYTES) {
                    toast.error("File is too large — max 5MB");
                    e.target.value = "";
                    return;
                  }
                  setResume(file);
                }}
              />
              <p className="text-xs text-muted-foreground">
                This employer requires a CV/resume with every application.
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="apply-phone">Phone number</Label>
            <Input
              id="apply-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 90000 00000"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={apply.isPending} className="rounded-xl">
              {apply.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul className="mt-2 grid gap-2">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
