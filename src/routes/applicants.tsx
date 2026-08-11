import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPLICANTS, STATUS_STYLE } from "@/lib/jobs";

export const Route = createFileRoute("/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants — KochiWorks HR" },
      {
        name: "description",
        content: "HR teams can review candidate details and update application status.",
      },
      { property: "og:title", content: "Applicants — KochiWorks HR" },
      { property: "og:description", content: "Candidate contact details, experience and status." },
    ],
  }),
  component: ApplicantsPage,
});

function ApplicantsPage() {
  const jobs = [...new Set(APPLICANTS.map((a) => a.jobTitle))];
  const [job, setJob] = useState(jobs[0]!);
  const list = APPLICANTS.filter((a) => a.jobTitle === job);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Applicants</h1>
      <p className="mt-1 text-sm text-muted-foreground">People who applied to your openings.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {jobs.map((j) => (
          <button
            key={j}
            onClick={() => setJob(j)}
            className={`min-h-10 rounded-full border px-3.5 py-2 text-sm transition-colors ${
              job === j
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            {j}
          </button>
        ))}
      </div>


      <div className="mt-6 grid gap-4">
        {list.map((a) => (
          <article key={a.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold">{a.name}</h2>
                <p className="truncate text-sm text-muted-foreground">{a.headline}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" /> {a.phone}
              </span>
              <span className="inline-flex min-w-0 items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{a.email}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" /> {a.area} · {a.experience}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button size="sm" variant="outline" className="col-span-2 h-10 rounded-full">
                <FileText className="h-4 w-4" /> Resume
              </Button>
              <Button size="sm" variant="secondary" className="h-10 rounded-full">
                Shortlist
              </Button>
              <Button size="sm" className="h-10 rounded-full">
                Select
              </Button>
            </div>

          </article>
        ))}
      </div>
    </div>
  );
}
