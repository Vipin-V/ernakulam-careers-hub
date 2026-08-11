import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRole, useSession, signOut as authSignOut, ROLE_LABEL, type Role } from "@/lib/auth";

const NAV: { to: string; label: string; roles: (Role | "guest")[] }[] = [
  { to: "/", label: "Find jobs", roles: ["guest", "seeker", "hr", "admin"] },
  { to: "/applications", label: "My applications", roles: ["seeker"] },
  { to: "/post", label: "Post a job", roles: ["hr"] },
  { to: "/applicants", label: "Applicants", roles: ["hr"] },
  { to: "/admin", label: "Approvals", roles: ["admin"] },
];

export function SiteHeader() {
  const role = useRole();
  const session = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const items = NAV.filter((n) => n.roles.includes(role ?? "guest"));

  const signOut = async () => {
    await authSignOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  const linkCls =
    "rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:font-medium data-[status=active]:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </span>
          <span className="truncate font-display text-lg font-bold tracking-tight">
            Kochi<span className="text-primary">Works</span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 text-sm md:flex">
          {items.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className={linkCls}>
              {n.label}
            </Link>
          ))}
          {session ? (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button size="sm" className="rounded-full" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </nav>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button size="icon" variant="ghost" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[82vw] max-w-xs p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {session ? (role ? ROLE_LABEL[role] : "Signed in") : "Browsing as guest"}
            </p>
            <nav className="mt-5 grid gap-1 text-base">
              {items.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeOptions={{ exact: n.to === "/" }}
                  onClick={() => setOpen(false)}
                  className={linkCls + " px-4 py-3"}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6">
              {session ? (
                <Button variant="outline" className="w-full rounded-xl" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              ) : (
                <Button className="w-full rounded-xl" asChild onClick={() => setOpen(false)}>
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
