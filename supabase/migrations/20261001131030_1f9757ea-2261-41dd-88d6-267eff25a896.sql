create type public.app_role as enum ('admin','hr','seeker');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  company text,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null, company text not null, area text not null, type text not null,
  pay text not null, shift text not null default '', openings int not null default 1,
  contact text not null default '', about text not null default '',
  duties text[] not null default '{}', requirements text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  requires_resume boolean not null default false,
  applications_closed boolean not null default false,
  posted_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select on public.jobs to anon;
grant select, insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "Approved jobs public" on public.jobs for select using (status = 'approved');
create policy "HR sees own jobs" on public.jobs for select to authenticated using (posted_by = auth.uid());
create policy "Admin sees all jobs" on public.jobs for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "HR posts jobs" on public.jobs for insert to authenticated
  with check (posted_by = auth.uid() and status = 'pending' and public.has_role(auth.uid(),'hr'));
create policy "Admin updates jobs" on public.jobs for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins can delete jobs" on public.jobs for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references auth.users(id) on delete cascade,
  applicant_name text not null, applicant_phone text not null, applicant_email text not null default '',
  resume_url text,
  status text not null default 'Under review' check (status in ('Under review','Shortlisted','Selected','Not selected')),
  note text not null default '',
  applied_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);
grant select, insert, update on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Seeker sees own apps" on public.applications for select to authenticated using (applicant_id = auth.uid());
create policy "HR sees apps to own jobs" on public.applications for select to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()));
create policy "Admin sees apps" on public.applications for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Seeker applies" on public.applications for insert to authenticated
  with check (applicant_id = auth.uid() and status = 'Under review'
    and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'approved' and not j.applications_closed));
create policy "HR updates apps" on public.applications for update to authenticated
  using (exists (select 1 from public.jobs j where j.id = job_id and j.posted_by = auth.uid()));

create table public.saved_jobs (
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);
grant select, insert, delete on public.saved_jobs to authenticated;
grant all on public.saved_jobs to service_role;
alter table public.saved_jobs enable row level security;
create policy "Own saved" on public.saved_jobs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text not null default '', link text, read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "Own notifs read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "Own notifs update" on public.notifications for update to authenticated using (user_id = auth.uid());

create or replace function public.set_own_company(_company text) returns void
language plpgsql security definer set search_path = public as $$
begin update public.user_roles set company = _company where user_id = auth.uid(); end; $$;
grant execute on function public.set_own_company(text) to authenticated;

create or replace function public.set_applications_closed(_job_id uuid, _closed boolean) returns void
language plpgsql security definer set search_path = public as $$
begin update public.jobs set applications_closed = _closed where id = _job_id and posted_by = auth.uid(); end; $$;
grant execute on function public.set_applications_closed(uuid, boolean) to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare r app_role := case when new.raw_user_meta_data->>'role' = 'hr' then 'hr'::app_role else 'seeker'::app_role end;
begin
  insert into public.user_roles (user_id, role, company)
  values (new.id, r, case when r = 'hr' then new.raw_user_meta_data->>'company' end)
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.notify_job_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.status <> 'pending' then
    insert into public.notifications (user_id, title, body, link)
    values (new.posted_by, 'Job ' || new.status, new.title || ' was ' || new.status || ' by admin.', '/post');
  end if;
  return new;
end; $$;
create trigger jobs_status_notify after update on public.jobs for each row execute function public.notify_job_status();

create or replace function public.notify_application() returns trigger
language plpgsql security definer set search_path = public as $$
declare j public.jobs;
begin
  select * into j from public.jobs where id = new.job_id;
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, title, body, link)
    values (j.posted_by, 'New applicant', new.applicant_name || ' applied for ' || j.title, '/applicants');
  elsif new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, link)
    values (new.applicant_id, 'Application ' || lower(new.status), j.title || ' — ' || new.status, '/applications');
  end if;
  return new;
end; $$;
create trigger applications_notify after insert or update on public.applications for each row execute function public.notify_application();

create policy "Seekers upload their own resume" on storage.objects for insert to authenticated
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Owner, hiring HR, or admin can read resume" on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.applications a join public.jobs j on j.id = a.job_id
               where a.resume_url = storage.objects.name and j.posted_by = auth.uid())));