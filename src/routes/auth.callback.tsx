import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — KochiWorks" },
      { name: "description", content: "Completing your KochiWorks sign-in." },
      { property: "og:title", content: "Signing you in — KochiWorks" },
      { property: "og:description", content: "Completing your KochiWorks sign-in." },
    ],
  }),
  component: CallbackPage,
});

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = safeNext(params.get("next"));

    const go = () => navigate({ to: next, replace: true });

    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) go();
    });
    supabase.auth.getSession().then(({ data: d }) => {
      if (d.session) go();
    });

    const timeout = setTimeout(() => navigate({ to: "/login", replace: true }), 8000);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Signing you in…
      </div>
    </div>
  );
}
