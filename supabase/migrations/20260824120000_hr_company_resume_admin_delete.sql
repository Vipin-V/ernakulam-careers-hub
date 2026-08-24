-- HR company on registration, resume requirement on jobs, resume upload on
-- applications, and admin's ability to delete a job (e.g. a fake posting).

-- 1. HR's company/organization, captured at sign-up. Populated via the
--    set_own_company() RPC below (not editable afterwards from the jobs form,
--    so HR can't post under a different company name than they registered).
alter table public.jobs
  add column if not exists requires_resume boolean not null default false;

alter table public.applications
  add column if not exists resume_url text;

alter table public.user_roles
  add column if not exists company text;

-- 2. Lets a signed-in user set their own company name without touching their
--    role (avoids opening a general "update your own user_roles row" RLS
--    policy, which would let a seeker grant themselves admin/hr).
create or replace function public.set_own_company(_company text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_roles
  set company = _company
  where user_id = auth.uid();
end;
$$;

grant execute on function public.set_own_company(text) to authenticated;

-- 3. Admins can delete any job posting (e.g. a fake one).
create policy "Admins can delete jobs"
  on public.jobs for delete
  using (public.has_role(_user_id => auth.uid(), _role => 'admin'));

-- 4. Private storage bucket for applicant resumes/CVs.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Applicants upload into a folder named after their own user id.
create policy "Seekers upload their own resume"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Seekers replace their own resume"
  on storage.objects for update
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Seekers delete their own resume"
  on storage.objects for delete
  using (
    bucket_id = 'resumes'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Readable by: the applicant who owns it, the HR who posted the job it was
-- attached to, or an admin.
create policy "Owner, hiring HR, or admin can read resume"
  on storage.objects for select
  using (
    bucket_id = 'resumes'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.has_role(_user_id => auth.uid(), _role => 'admin')
      or exists (
        select 1
        from public.applications a
        join public.jobs j on j.id = a.job_id
        where a.resume_url = storage.objects.name
          and j.posted_by = auth.uid()
      )
    )
  );
