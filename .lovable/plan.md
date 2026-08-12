# KochiWorks: from prototype to working website

Right now every screen is beautiful but powered by hard-coded sample data in one file. Sign-in is real, but the role you pick is stored in the browser (anyone can switch themselves to "admin"). Nothing you post, approve, apply to, save, or get notified about survives a refresh.

Here is the step-by-step path to a real, publishable site.

## Step 1 — Database foundation
Create the backend tables and security rules:
- `profiles` (name, phone, area, headline, experience) created automatically on sign-up
- `user_roles` (seeker / hr / admin) in its own table, so roles cannot be faked from the browser
- `jobs` (title, company, area, type, pay, description, duties, requirements, shift, openings, contact, status pending/approved/rejected, posted_by, created_at)
- `applications` (job, applicant, status, note, applied_at) with one application per job per user
- `saved_jobs` (user, job)
- `notifications` (user, title, body, link, read)

Access rules: everyone can read approved jobs; HR sees and manages only their own postings and the applicants for them; seekers see only their own applications and saves; admins can review everything. Seed a handful of realistic Ernakulam jobs so the site never looks empty on launch.

## Step 2 — Real roles and account setup
- Assign the chosen role at sign-up and store it in the database instead of localStorage.
- Admin role is granted manually (not selectable at sign-up) to prevent anyone claiming it.
- Add a short "complete your profile" step (name, phone, area) so HR sees real applicant details.
- Header, navigation, and route access driven by the real role; protect `/post`, `/applicants`, `/admin`, `/applications`, `/saved` behind sign-in.

## Step 3 — Jobs: post → approve → publish
- `/post` actually saves a job as "pending", with validation, and lists that HR's own jobs with live status.
- `/admin` shows the real pending queue with approve / reject (and a reason), plus real counters.
- Home and job detail pages read approved jobs from the database, with search, filters, loading and empty states.

## Step 4 — Applying and tracking
- The Apply button on the job detail page creates a real application (blocked if not signed in, with a sign-in prompt; prevents duplicates).
- `/applications` lists the seeker's real applications and current status.
- `/applicants` lets HR filter by their job, see contact details, and change status to Shortlisted / Selected / Not selected.

## Step 5 — Saved jobs and notifications for real
- Move saved jobs from browser storage to the account so they follow the user across devices.
- Generate real notifications on the events that matter: job approved or rejected (to HR), new applicant (to HR), application status changed (to seeker). Bell shows real unread count and marks read.

## Step 6 — Launch readiness
- Per-page titles/descriptions and share previews, sitemap and robots.
- Mobile pass on every screen at 393px, plus loading skeletons and error states.
- Google sign-in provider enabled and tested; sign-out clears cached data.
- Security scan, then publish.

## Technical notes
- Backend is Lovable Cloud; all reads/writes go through server functions with row-level security; roles checked via a `has_role` function, never from client state.
- Data fetching via TanStack Query with route loaders; `src/lib/jobs.ts` mock arrays get deleted as each screen is switched over.
- Admin/HR-only routes move under the authenticated layout; public job pages stay server-rendered for shareable links.

## Suggested order
Steps 1–2 first (nothing else works without them), then 3, then 4, then 5, then 6. Each step is independently testable.
