import { MapPin, Wallet, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Job } from "@/lib/jobs";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/SaveButton";

export function JobCard({ job, action }: { job: Job; action?: React.ReactNode }) {
  return (
    <div className="relative">
      <SaveButton id={job.id} className="absolute right-4 top-4 z-10" />
      <Link
        to="/jobs/$id"
        params={{ id: job.id }}
        className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
      <article>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 pr-12">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-card-foreground">{job.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <Badge variant="secondary" className="mt-3 rounded-full">
          {job.type}
        </Badge>


        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {job.area}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
            <Wallet className="h-4 w-4 shrink-0 text-primary" />
            {job.pay}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />
            {job.posted}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {job.tags.map((t) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
          <div className="ml-auto">{action}</div>
        </div>
      </article>
      </Link>
    </div>
  );
}

