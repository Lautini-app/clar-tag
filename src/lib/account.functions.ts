// DSGVO-Delete: remove all clar_tag data for the caller, including anonymous
// family members they admin, then delete the auth user itself.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin.schema("clar_tag");
    const userId = context.userId;

    // 1. Find families the caller administers.
    const { data: families, error: famErr } = await admin
      .from("families")
      .select("id")
      .eq("admin_user_id", userId);
    if (famErr) throw famErr;
    const familyIds = (families ?? []).map((f) => f.id);

    // 2. Collect family_members (and their linked auth users) in those families.
    let memberIds: string[] = [];
    let memberUserIds: string[] = [];
    if (familyIds.length > 0) {
      const { data: members, error: memErr } = await admin
        .from("family_members")
        .select("id, user_id")
        .in("family_id", familyIds);
      if (memErr) throw memErr;
      memberIds = (members ?? []).map((m) => m.id);
      memberUserIds = (members ?? [])
        .map((m) => m.user_id)
        .filter((u): u is string => !!u && u !== userId);
    }

    // 3. Delete dependent rows (status → invites → members → families).
    if (memberIds.length > 0) {
      const { error } = await admin
        .from("family_member_status")
        .delete()
        .in("member_id", memberIds);
      if (error) throw error;
    }
    if (familyIds.length > 0) {
      const { error: invErr } = await admin
        .from("family_invites")
        .delete()
        .in("family_id", familyIds);
      if (invErr) throw invErr;

      const { error: memDelErr } = await admin
        .from("family_members")
        .delete()
        .in("family_id", familyIds);
      if (memDelErr) throw memDelErr;

      const { error: famDelErr } = await admin
        .from("families")
        .delete()
        .in("id", familyIds);
      if (famDelErr) throw famDelErr;
    }

    // 4. Delete caller's own clar_tag rows.
    const ownTables = [
      "workflow_completions",
      "workflow_schedules",
      "workflows",
      "profiles",
    ] as const;
    for (const table of ownTables) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      if (error) throw error;
    }

    // 5. Delete anonymous auth users that were attached to those members.
    let deletedAnonCount = 0;
    for (const uid of memberUserIds) {
      try {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
        // Only delete anonymous users — never touch real accounts.
        if (u?.user?.is_anonymous) {
          const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
          if (!error) deletedAnonCount++;
        }
      } catch (e) {
        console.warn("[deleteMyAccount] anon user cleanup failed", uid, e);
      }
    }

    // 6. Finally, delete the caller's auth user.
    const { error: delUserErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delUserErr) throw delUserErr;

    return { ok: true, deletedAnonCount };
  });
