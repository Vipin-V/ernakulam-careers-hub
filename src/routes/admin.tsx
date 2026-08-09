import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { PENDING_JOBS, JOBS } from "@/lib/jobs";

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
  const [queue, setQueue] = useState(PENDING_JOBS);
  const remove = (id: string) => setQueue((p) => p.filter((j) => j.id !== id));

  const stats = [
    { label: "Pending review", value: queue.length },
    { label: "Live jobs", value: JOBS.length },
    { label: "HR accounts", value: 24 },
    { label: "Seekers", value: "1.2k" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Approval queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Nothing reaches job seekers until you approve it.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {queue.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            action={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => remove(job.id)}>
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" className="rounded-full" onClick={() => remove(job.id)}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
              </div>
            }
          />
        ))}
      </div>
      {queue.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">Queue is clear. </p>
      )}
    </div>
  );
}
