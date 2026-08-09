import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { JOBS, JOB_TYPES, AREAS } from "@/lib/jobs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jobs in Ernakulam — KochiWorks" },
      {
        name: "description",
        content:
          "Browse part-time, full-time, daily wage, catering, event and internship openings across Ernakulam, Kerala.",
      },
      { property: "og:title", content: "Jobs in Ernakulam — KochiWorks" },
      {
        property: "og:description",
        content: "Local job opportunities across Kakkanad, Edappally, Aluva, Fort Kochi and more.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const results = useMemo(
    () =>
      JOBS.filter(
        (j) =>
          (!type || j.type === type) &&
          (!area || j.area === area) &&
          (j.title + j.company).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, type, area],
  );

  return (
    <>
      <section
        className="px-4 py-14 text-primary-foreground sm:py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" /> Ernakulam district only
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">
            Work near you, in Kochi
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-85 sm:text-base">
            Daily wage gigs, catering shifts, event crews, internships and full-time roles — all
            verified before they reach you.
          </p>

          <div className="mt-7 flex flex-col gap-2 rounded-2xl bg-card p-2 shadow-lg sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Job title or company"
                className="border-0 bg-transparent px-0 text-foreground shadow-none focus-visible:ring-0"
              />
            </div>
            <Button size="lg" className="rounded-xl">
              Search
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-2">
          <Chip active={!type} onClick={() => setType(null)} label="All types" />
          {JOB_TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)} label={t} />
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          <Chip active={!area} onClick={() => setArea(null)} label="All areas" />
          {AREAS.map((a) => (
            <Chip key={a} active={area === a} onClick={() => setArea(a)} label={a} />
          ))}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{results.length} opportunities</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              action={
                <Button size="sm" variant="secondary" className="rounded-full">
                  Apply
                </Button>
              }
            />
          ))}
        </div>
        {results.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No openings match your filters yet.
          </p>
        )}
      </section>
    </>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
