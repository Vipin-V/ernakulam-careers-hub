ALTER TABLE public.jobs ADD COLUMN landmark text NOT NULL DEFAULT '';

CREATE POLICY "HR updates own jobs" ON public.jobs FOR UPDATE TO authenticated
  USING (posted_by = auth.uid()) WITH CHECK (posted_by = auth.uid());

CREATE OR REPLACE FUNCTION public.guard_job_update() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') AND auth.uid() IS NOT NULL THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.posted_by IS DISTINCT FROM OLD.posted_by
       OR NEW.company IS DISTINCT FROM OLD.company THEN
      RAISE EXCEPTION 'Not allowed to change status, owner or company';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER jobs_guard_update BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.guard_job_update();