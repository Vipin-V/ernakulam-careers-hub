import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { AREAS, JOB_TYPES } from "@/lib/jobs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KochiWorks — Local work, right here in Ernakulam" },
      { name: "description", content: "Part-time shifts, full-time roles, catering, events and internships — every opening verified, all within Ernakulam." },
      { property: "og:title", content: "KochiWorks — Local work in Ernakulam" },
      { property: "og:description", content: "Verified jobs, shifts and internships from Kakkanad to Fort Kochi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  ["01", "Employers post", "Cafés, caterers, event crews and offices across the district list openings with clear pay."],
  ["02", "We verify", "Every listing is checked by our team before anyone sees it. No fake jobs, no hidden fees."],
  ["03", "You apply", "One tap to apply, and you can follow your status from review to shortlist."],
];

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pt-20">
        <p className="mb-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          <span className="h-px w-10 bg-primary" /> Ernakulam · Kerala
        </p>
        <h1 className="font-display text-[clamp(2.6rem,9vw,6.5rem)] font-bold leading-[0.92] tracking-tight">
          Work that's
          <br />
          <span className="italic font-medium text-primary">a bus ride</span> away.
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            Weekend catering gigs, event crews, internships, full-time roles — every opening from Aluva to Fort Kochi, checked by a real person before it reaches you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/jobs" className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
              Browse jobs <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
            <Link to="/login" className="inline-flex h-12 items-center rounded-full border border-border px-6 font-medium hover:bg-muted">
              I'm hiring
            </Link>
          </div>
        </div>
        {/* Backwater lines */}
        <svg aria-hidden viewBox="0 0 1200 120" className="mt-14 w-full text-primary/40" fill="none" stroke="currentColor">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} strokeWidth={1.2} d={`M0 ${30 + i * 20} C 200 ${10 + i * 20}, 400 ${50 + i * 20}, 600 ${30 + i * 20} S 1000 ${10 + i * 20}, 1200 ${30 + i * 20}`} />
          ))}
        </svg>
      </section>

      {/* Areas marquee */}
      <section className="border-y border-border bg-secondary/50 py-5">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 font-display text-2xl font-semibold text-secondary-foreground/80 sm:text-3xl">
          {[...AREAS, ...AREAS].map((a, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap">
              {a} <span className="text-primary">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="max-w-sm font-display text-3xl font-bold leading-tight sm:text-4xl">Whatever kind of work you're after.</h2>
          <Link to="/jobs" className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {JOB_TYPES.map((t, i) => (
            <Link
              key={t}
              to="/jobs"
              className={`rounded-2xl border border-border px-5 py-4 font-display text-lg font-semibold transition-all hover:-translate-y-1 hover:border-primary hover:text-primary ${i % 3 === 0 ? "bg-card" : ""}`}
            >
              {t}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="mb-12 font-display text-3xl font-bold sm:text-4xl">
            Honest listings, <span className="italic font-medium opacity-70">by design.</span>
          </h2>
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map(([n, t, d]) => (
              <li key={n} className="border-t border-background/20 pt-5">
                <span className="font-display text-sm opacity-60">{n}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Split CTA */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-20 md:grid-cols-2">
        <Link to="/jobs" className="group rounded-3xl bg-primary p-8 text-primary-foreground sm:p-10">
          <p className="text-sm opacity-80">For job seekers</p>
          <h3 className="mt-3 font-display text-3xl font-bold">Find your next shift.</h3>
          <ArrowUpRight className="mt-10 h-8 w-8 transition-transform group-hover:rotate-45" />
        </Link>
        <Link to="/login" className="group rounded-3xl border border-border bg-card p-8 sm:p-10">
          <p className="text-sm text-muted-foreground">For employers & HR</p>
          <h3 className="mt-3 font-display text-3xl font-bold">Hire locals, fast.</h3>
          <ArrowUpRight className="mt-10 h-8 w-8 text-primary transition-transform group-hover:rotate-45" />
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} KochiWorks · Made in Ernakulam
      </footer>
    </div>
  );
}
