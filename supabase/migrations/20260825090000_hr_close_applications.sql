-- Lets HR close applications on their own job once they have enough, without
-- opening a general "HR can update any job" RLS policy (which would let HR
-- edit fields like status that belong to the admin approval flow).

alter table public.jobs
  add column if not exists applications_closed boolean not null default false;

create or replace function public.set_applications_closed(_job_id uuid, _closed boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.jobs
  set applications_closed = _closed
  where id = _job_id
    and posted_by = auth.uid();
end;
$$;

grant execute on function public.set_applications_closed(uuid, boolean) to authenticated;
