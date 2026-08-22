import { createFileRoute } from "@tanstack/react-router";
import { JobCard } from "@/components/JobCard";
import { MY_APPLICATIONS, STATUS_STYLE } from "@/lib/jobs";
import { useRequireRole } from "@/lib/auth";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My applications — KochiWorks" },
      {
        name: "description",
        content: "Track the status of every job you applied to across Ernakulam.",
      },
      { property: "og:title", content: "My applications — KochiWorks" },
      { property: "og:description", content: "See if your application is under review or selected." },
    ],
  }),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const authorized = useRequireRole(["seeker"]);
  if (!authorized) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">My applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {MY_APPLICATIONS.length} applications · updates appear here
      </p>

      <div className="mt-6 grid gap-4">
        {MY_APPLICATIONS.map((a) => (
          <div key={a.job.id} className="grid gap-2">
            <JobCard
              job={a.job}
              action={
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[a.status]}`}>
                  {a.status}
                </span>
              }
            />
            <p className="px-1 text-xs text-muted-foreground">
              Applied {a.appliedOn} · {a.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
