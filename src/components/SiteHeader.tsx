import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

const nav = [
  { to: "/", label: "Find jobs" },
  { to: "/post", label: "For HR" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </span>
          <span className="truncate font-display text-lg font-bold tracking-tight">
            Kochi<span className="text-primary">Works</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:font-medium data-[status=active]:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
