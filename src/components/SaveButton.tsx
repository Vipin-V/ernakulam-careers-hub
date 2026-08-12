import { Bookmark } from "lucide-react";
import { toggleSaved, useSavedIds } from "@/lib/saved";

export function SaveButton({ id, className = "" }: { id: string; className?: string }) {
  const saved = useSavedIds().includes(id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save this job"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(id);
      }}
      className={`grid h-10 w-10 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors hover:border-primary/50 ${
        saved ? "text-primary" : "text-muted-foreground"
      } ${className}`}
    >
      <Bookmark className={`h-4.5 w-4.5 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
