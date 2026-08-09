import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { JOB_TYPES, AREAS, PENDING_JOBS, JOBS } from "@/lib/jobs";

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

function PostPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Post an opportunity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions go to an admin for approval before job seekers see them.
        </p>

        <form
          className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <Field label="Job title">
            <Input placeholder="e.g. Catering staff for wedding" />
          </Field>
          <Field label="Company / organiser">
            <Input placeholder="e.g. Malabar Caterers" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job type">
              <Select options={JOB_TYPES} />
            </Field>
            <Field label="Area in Ernakulam">
              <Select options={AREAS} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pay">
              <Input placeholder="₹1,200 / day" />
            </Field>
            <Field label="Openings">
              <Input type="number" placeholder="5" />
            </Field>
          </div>
          <Field label="Description">
            <Textarea rows={5} placeholder="Timings, requirements, contact details…" />
          </Field>
          <Button type="submit" size="lg" className="rounded-xl justify-self-start">
            Submit for approval
          </Button>
        </form>
      </section>

      <aside>
        <h2 className="font-display text-lg font-semibold">Your postings</h2>
        <div className="mt-4 grid gap-4">
          <JobCard
            job={PENDING_JOBS[0]!}
            action={
              <span className="rounded-full bg-accent/25 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                Awaiting approval
              </span>
            }
          />
          <JobCard
            job={JOBS[0]!}
            action={
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                Live
              </span>
            }
          />
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

function Select({ options }: { options: readonly string[] }) {
  return (
    <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
