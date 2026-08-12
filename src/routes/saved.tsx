import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/JobCard";
import { ALL_JOBS } from "@/lib/jobs";
import { useSavedIds } from "@/lib/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved jobs — KochiWorks" },
      {
        name: "description",
        content: "Your bookmarked job openings across Ernakulam, ready to apply whenever you are.",
      },
      { property: "og:title", content: "Saved jobs — KochiWorks" },
      { property: "og:description", content: "Come back to the Kochi roles you bookmarked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const ids = useSavedIds();
  const jobs = ALL_JOBS.filter((j) => ids.includes(j.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Saved jobs</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {jobs.length} bookmarked {jobs.length === 1 ? "role" : "roles"}
      </p>

      {jobs.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <Bookmark className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Tap the bookmark icon on any job to keep it here.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/">Browse jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
