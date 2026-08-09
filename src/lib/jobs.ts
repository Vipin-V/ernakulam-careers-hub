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
