import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, FileText, Loader2, Search, X, MessageCircle, ChevronDown, Check, MapPin, CalendarClock, Bike, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_STYLE, type AppStatus, type DbJob } from "@/lib/jobs";
import { useRequireRole } from "@/lib/auth";
import { whatsappLink, toCsv } from "@/lib/contact";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants — KochiWorks HR" },
      { name: "description", content: "Review candidates, filter your pipeline and reach applicants on WhatsApp." },
      { property: "og:title", content: "Applicants — KochiWorks HR" },
      { property: "og:description", content: "Candidate pipeline with one-tap WhatsApp and call." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApplicantsPage,
});

type ApplicantRow = Tables<"applications"> & { jobs: DbJob };
const STATUSES: AppStatus[] = ["Under review", "Shortlisted", "Selected", "Not selected"];
const TABS: ("All" | AppStatus)[] = ["All", ...STATUSES];

function ResumeLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    setLoading(false);
    if (error || !data) { toast.error("Couldn't open resume"); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <Button size="sm" variant="ghost" className="h-10 rounded-full" onClick={open} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      Resume
    </Button>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full bg-secondary px-2.5 text-xs font-medium text-secondary-foreground">
      {icon}
      {children}
    </span>
  );
}

function ApplicantCard({ a, onStatus, onNote }: { a: ApplicantRow; onStatus: (s: AppStatus) => void; onNote: (n: string) => void }) {
  const initials = a.applicant_name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <article className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold leading-tight">{a.applicant_name}</h2>
          <p className="truncate text-sm text-muted-foreground">{a.jobs.title}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium transition-opacity active:opacity-70 ${STATUS_STYLE[a.status as AppStatus]}`}
          >
            {a.status} <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1.5">
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} className="rounded-xl py-2" onClick={() => s !== a.status && onStatus(s)}>
                {s}
                {s === a.status && <Check className="ml-auto h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 grid gap-1.5 pl-14 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{a.applicant_phone}</span>
        <span className="inline-flex min-w-0 items-center gap-2">
          <Mail className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{a.applicant_email}</span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 pl-14">
        {a.locality && <Chip icon={<MapPin className="h-3 w-3" />}>{a.locality}</Chip>}
        {a.availability && <Chip icon={<CalendarClock className="h-3 w-3" />}>{a.availability}</Chip>}
        {a.has_vehicle && <Chip icon={<Bike className="h-3 w-3" />}>Own vehicle</Chip>}
      </div>

      <textarea
        defaultValue={a.hr_notes}
        onBlur={(e) => e.target.value !== a.hr_notes && onNote(e.target.value)}
        placeholder="Private note — only you can see this"
        rows={2}
        className="mt-3 w-full resize-none rounded-2xl bg-muted/60 px-3.5 py-2.5 text-sm outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
      />

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
        <Button asChild className="h-11 rounded-full sm:h-10">
          <a href={whatsappLink(a.applicant_phone, a.applicant_name, a.jobs.company, a.jobs.title)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary" className="h-11 rounded-full sm:h-10">
          <a href={`tel:${a.applicant_phone}`}><Phone className="h-4 w-4" /> Call</a>
        </Button>
        {a.resume_url && <ResumeLink path={a.resume_url} />}
      </div>
    </article>
  );
}

function ApplicantsPage() {
  const authorized = useRequireRole(["hr"]);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");
  const [job, setJob] = useState<string | null>(null);

  const { data: applicants = [], isPending } = useQuery({
    queryKey: ["myApplicants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, jobs(*)").order("applied_at", { ascending: false });
      if (error) throw error;
      return data as ApplicantRow[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppStatus }) => {
      const { error } = await supabase.from("applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      toast.success(`Moved to ${v.status}`);
      queryClient.invalidateQueries({ queryKey: ["myApplicants"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong"),
  });

  if (!authorized) return null;

  const jobTitles = [...new Set(applicants.map((a) => a.jobs.title))];
  const term = q.trim().toLowerCase();
  const base = applicants.filter(
    (a) =>
      (!job || a.jobs.title === job) &&
      (!term || [a.applicant_name, a.applicant_phone, a.jobs.title].some((v) => v.toLowerCase().includes(term))),
  );
  const count = (t: (typeof TABS)[number]) => (t === "All" ? base.length : base.filter((a) => a.status === t).length);
  const list = tab === "All" ? base : base.filter((a) => a.status === tab);

  const saveNote = async (id: string, hr_notes: string) => {
    const { error } = await supabase.from("applications").update({ hr_notes }).eq("id", id);
    if (error) { toast.error("Couldn't save note"); return; }
    toast.success("Note saved");
    queryClient.invalidateQueries({ queryKey: ["myApplicants"] });
  };

  const exportCsv = () => {
    const csv = toCsv([
      ["Name", "Phone", "Email", "Job", "Status", "Locality", "Availability", "Own vehicle", "Note", "Applied"],
      ...list.map((a) => [a.applicant_name, a.applicant_phone, a.applicant_email, a.jobs.title, a.status, a.locality, a.availability, a.has_vehicle ? "Yes" : "No", a.hr_notes, new Date(a.applied_at).toLocaleDateString()]),
    ]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = `applicants-${tab.toLowerCase().replace(/\s+/g, "-")}.csv`;
    link.click();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Applicants</h1>
          <p className="mt-1 text-sm text-muted-foreground">{applicants.length} people applied to your openings.</p>
        </div>
        <Button variant="secondary" className="h-10 rounded-full" onClick={exportCsv} disabled={!list.length}>
          <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      <div className="sticky top-14 z-10 -mx-4 mt-5 space-y-3 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone or job"
            className="h-11 w-full rounded-2xl bg-muted/70 pl-10 pr-10 text-[15px] outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
          />
          {q && (
            <button aria-label="Clear search" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-muted-foreground/30 text-background">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
          <div className="inline-flex gap-1 rounded-2xl bg-muted/70 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 text-sm font-medium transition-all ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                <span className="text-xs tabular-nums opacity-60">{count(t)}</span>
              </button>
            ))}
          </div>
        </div>

        {jobTitles.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {[null, ...jobTitles].map((j) => (
              <button
                key={j ?? "all"}
                onClick={() => setJob(j)}
                className={`h-8 rounded-full border px-3 text-xs transition-colors ${
                  job === j ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {j ?? "All jobs"}
              </button>
            ))}
          </div>
        )}
      </div>

      {isPending ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}
        </div>
      ) : list.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <ApplicantCard key={a.id} a={a} onStatus={(status) => setStatus.mutate({ id: a.id, status })} onNote={(n) => saveNote(a.id, n)} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-medium">{term || tab !== "All" ? "No matches" : "No applicants yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {term || tab !== "All" ? "Try a different search or tab." : "New applications will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
