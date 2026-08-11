import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Wallet, Clock, Users, CalendarClock, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getJob, jobDetail } from "@/lib/jobs";

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => {
    const job = getJob(params.id);
    if (!job) throw notFound();
    return { job, detail: jobDetail(params.id) };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Job unavailable — KochiWorks" }, { name: "robots", content: "noindex" }] };
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
      <p className="mt-2 text-sm text-muted-foreground">This opening may have been filled or removed.</p>
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
        <Badge variant="secondary" className="rounded-full">
          {job.type}
        </Badge>
        <h1 className="mt-3 font-display text-2xl font-bold leading-snug sm:text-3xl">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Fact icon={MapPin} label="Location" value={`${job.area}, Ernakulam`} />
          <Fact icon={Wallet} label="Pay" value={job.pay} />
          <Fact icon={CalendarClock} label="Shift" value={detail.shift} />
          <Fact icon={Users} label="Openings" value={`${detail.openings}`} />
          <Fact icon={Clock} label="Posted" value={job.posted} />
          <Fact icon={Phone} label="Contact" value={detail.contact} />
        </dl>
      </header>

      <section className="mt-5 grid gap-5 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">About the job</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{detail.about}</p>
        </div>
        <List title="What you'll do" items={detail.duties} />
        <List title="Requirements" items={detail.requirements} />
        <div className="flex flex-wrap gap-2">
          {job.tags.map((t: string) => (
            <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 mt-6">
        <Button size="lg" className="w-full rounded-xl shadow-lg">
          Apply now
        </Button>
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
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
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
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
