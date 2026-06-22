import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOrCreateCalendarToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const sb = context.supabase as any;

    const { data: existing } = await sb
      .from("calendar_tokens")
      .select("token")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing?.token) return { token: existing.token as string };

    const { data: created, error } = await sb
      .from("calendar_tokens")
      .insert({ user_id: userId })
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return { token: created.token as string };
  });

export const resetCalendarToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const sb = context.supabase as any;

    await sb.from("calendar_tokens").delete().eq("user_id", userId);

    const { data: created, error } = await sb
      .from("calendar_tokens")
      .insert({ user_id: userId })
      .select("token")
      .single();
    if (error) throw new Error(error.message);
    return { token: created.token as string };
  });
