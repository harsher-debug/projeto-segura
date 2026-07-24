import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getLocalAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const localAdmin = getLocalAdminSession();
    if (localAdmin) {
      return {
        user: {
          id: localAdmin.id,
          email: localAdmin.email,
          user_metadata: { nome: localAdmin.name, login: localAdmin.login },
        },
        isLocalAdmin: true,
      };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/entrar" });
    return { user: data.user, isLocalAdmin: false };
  },
  component: () => <Outlet />,
});
