export type JobType = "Full-time" | "Part-time" | "Daily wage" | "Catering" | "Events" | "Internship";

export type Job = {
  id: string;
  title: string;
  company: string;
  area: string;
  type: JobType;
  pay: string;
  posted: string;
  tags: string[];
  status: "pending" | "approved";
};

export const JOB_TYPES: JobType[] = [
  "Full-time",
  "Part-time",
  "Daily wage",
  "Catering",
  "Events",
  "Internship",
];

export const AREAS = [
  "Kakkanad",
  "Edappally",
  "Fort Kochi",
  "Aluva",
  "Vyttila",
  "Kaloor",
  "Perumbavoor",
  "Angamaly",
];

export const JOBS: Job[] = [
  {
    id: "1",
    title: "Catering Staff — Wedding Season",
    company: "Malabar Caterers",
    area: "Edappally",
    type: "Catering",
    pay: "₹1,200 / day",
    posted: "2h ago",
    tags: ["Immediate", "Food provided"],
    status: "approved",
  },
  {
    id: "2",
    title: "Frontend Developer Intern",
    company: "Infopark Labs",
    area: "Kakkanad",
    type: "Internship",
    pay: "₹15,000 / month",
    posted: "5h ago",
    tags: ["React", "6 months"],
    status: "approved",
  },
  {
    id: "3",
    title: "Event Setup Crew",
    company: "Backwater Events",
    area: "Fort Kochi",
    type: "Events",
    pay: "₹900 / shift",
    posted: "1d ago",
    tags: ["Weekend", "Night shift"],
    status: "approved",
  },
  {
    id: "4",
    title: "Retail Sales Associate",
    company: "Lulu Fashion Store",
    area: "Vyttila",
    type: "Part-time",
    pay: "₹14,000 / month",
    posted: "1d ago",
    tags: ["Evening shift"],
    status: "approved",
  },
  {
    id: "5",
    title: "Warehouse Helper",
    company: "Aluva Logistics",
    area: "Aluva",
    type: "Daily wage",
    pay: "₹850 / day",
    posted: "2d ago",
    tags: ["Physical work"],
    status: "approved",
  },
  {
    id: "6",
    title: "Accounts Executive",
    company: "Perumbavoor Timbers",
    area: "Perumbavoor",
    type: "Full-time",
    pay: "₹28,000 / month",
    posted: "3d ago",
    tags: ["Tally", "2+ yrs"],
    status: "approved",
  },
];

export const PENDING_JOBS: Job[] = [
  {
    id: "p1",
    title: "Banquet Service Boys (10 openings)",
    company: "Grand Kochi Hotels",
    area: "Kaloor",
    type: "Events",
    pay: "₹1,000 / day",
    posted: "20m ago",
    tags: ["Bulk hiring"],
    status: "pending",
  },
  {
    id: "p2",
    title: "Digital Marketing Intern",
    company: "Angamaly Media",
    area: "Angamaly",
    type: "Internship",
    pay: "₹8,000 / month",
    posted: "1h ago",
    tags: ["Remote friendly"],
    status: "pending",
  },
  {
    id: "p3",
    title: "Delivery Partner",
    company: "QuickKochi",
    area: "Kakkanad",
    type: "Part-time",
    pay: "₹600 / day + incentives",
    posted: "3h ago",
    tags: ["Own bike"],
    status: "pending",
  },
];

export type AppStatus = "Under review" | "Shortlisted" | "Selected" | "Not selected";

export const STATUS_STYLE: Record<AppStatus, string> = {
  "Under review": "bg-muted text-muted-foreground",
  Shortlisted: "bg-secondary text-secondary-foreground",
  Selected: "bg-primary/10 text-primary",
  "Not selected": "bg-destructive/10 text-destructive",
};

export const MY_APPLICATIONS: {
  job: Job;
  status: AppStatus;
  appliedOn: string;
  note: string;
}[] = [
  { job: JOBS[0]!, status: "Shortlisted", appliedOn: "12 Aug", note: "HR will call you for timings." },
  { job: JOBS[1]!, status: "Under review", appliedOn: "11 Aug", note: "Resume received." },
  { job: JOBS[3]!, status: "Selected", appliedOn: "8 Aug", note: "Report at store on Monday, 4 PM." },
  { job: JOBS[4]!, status: "Not selected", appliedOn: "5 Aug", note: "Position filled." },
];

export type Applicant = {
  id: string;
  name: string;
  headline: string;
  phone: string;
  email: string;
  area: string;
  experience: string;
  jobTitle: string;
  status: AppStatus;
};

export const APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Arjun Menon",
    headline: "Catering assistant",
    phone: "+91 98470 11223",
    email: "arjun.menon@gmail.com",
    area: "Edappally",
    experience: "2 yrs experience",
    jobTitle: JOBS[0]!.title,
    status: "Shortlisted",
  },
  {
    id: "a2",
    name: "Fathima Rasheed",
    headline: "Hotel management student",
    phone: "+91 90372 55810",
    email: "fathima.r@outlook.com",
    area: "Kaloor",
    experience: "Fresher",
    jobTitle: JOBS[0]!.title,
    status: "Under review",
  },
  {
    id: "a3",
    name: "Nikhil Das",
    headline: "React developer",
    phone: "+91 95448 90211",
    email: "nikhil.dev@gmail.com",
    area: "Kakkanad",
    experience: "1 yr internship",
    jobTitle: JOBS[1]!.title,
    status: "Selected",
  },
  {
    id: "a4",
    name: "Sneha Thomas",
    headline: "CS final year, MEC",
    phone: "+91 88910 44562",
    email: "sneha.thomas@gmail.com",
    area: "Vyttila",
    experience: "Fresher",
    jobTitle: JOBS[1]!.title,
    status: "Under review",
  },
];

export const ALL_JOBS = [...JOBS, ...PENDING_JOBS];
export const getJob = (id: string) => ALL_JOBS.find((j) => j.id === id);

export type JobDetail = {
  about: string;
  duties: string[];
  requirements: string[];
  shift: string;
  openings: number;
  contact: string;
};

const FALLBACK: JobDetail = {
  about: "A verified local opening in Ernakulam. The employer will share exact site details after shortlisting.",
  duties: ["Report on time at the assigned location", "Follow the supervisor's instructions", "Maintain workplace safety and hygiene"],
  requirements: ["Age 18+", "Valid ID proof", "Basic Malayalam or English"],
  shift: "Discussed at interview",
  openings: 2,
  contact: "hr@kochiworks.in",
};

export const JOB_DETAILS: Record<string, Partial<JobDetail>> = {
  "1": {
    about: "Malabar Caterers is hiring service staff for the wedding season across Ernakulam venues. Food and travel within the district are covered.",
    duties: ["Set up buffet counters and seating", "Serve guests during the function", "Clear and pack up after the event"],
    requirements: ["Neat appearance", "Ability to stand for long hours", "Previous catering work is a plus"],
    shift: "4 PM – 11 PM",
    openings: 12,
    contact: "+91 98470 22110",
  },
  "2": {
    about: "Infopark Labs offers a 6-month paid frontend internship with mentorship and a possible full-time offer.",
    duties: ["Build UI components in React", "Fix bugs and write tests", "Join daily stand-ups"],
    requirements: ["JavaScript and React basics", "Git knowledge", "Final-year student or fresher"],
    shift: "Mon–Fri, 9:30 AM – 6 PM",
    openings: 3,
    contact: "careers@infoparklabs.in",
  },
  "3": {
    about: "Backwater Events needs a setup crew for weekend shows around Fort Kochi.",
    duties: ["Load and unload equipment", "Assemble stage and lighting rigs", "Dismantle after the show"],
    requirements: ["Physically fit", "Comfortable with night shifts"],
    shift: "6 PM – 2 AM",
    openings: 8,
    contact: "+91 90480 71234",
  },
};

export const jobDetail = (id: string): JobDetail => ({ ...FALLBACK, ...(JOB_DETAILS[id] ?? {}) });
