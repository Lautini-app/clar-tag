import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const stageSchema = z.enum(["begleitet", "unterstuetzt", "selbststaendig"]);
const togglesSchema = z.record(z.string(), z.boolean()).optional();

export type FamilyRole = "admin" | "member" | "none";

export type ServerFamilyMember = {
  id: string;
  family_id: string;
  user_id: string | null;
  name: string;
  emoji: string;
  stage: z.infer<typeof stageSchema>;
  toggles: Record<string, boolean>;
};

export type FamilyContext = {
  role: FamilyRole;
  family: { id: string; name: string; admin_user_id: string } | null;
  members: ServerFamilyMember[];
  selfMemberId: string | null;
};

export const getFamilyContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FamilyContext> => {
    const { supabase, userId } = context;

    // Am I admin of a family?
    const { data: ownFamily } = await supabase
      .from("families")
      .select("id,name,admin_user_id")
      .eq("admin_user_id", userId)
      .maybeSingle();

    if (ownFamily) {
      const { data: members } = await supabase
        .from("family_members")
        .select("id,family_id,user_id,name,emoji,stage,toggles")
        .eq("family_id", ownFamily.id)
        .order("created_at", { ascending: true });
      return {
        role: "admin",
        family: ownFamily,
        members: (members ?? []) as ServerFamilyMember[],
        selfMemberId: null,
      };
    }

    // Am I a linked member?
    const { data: selfMember } = await supabase
      .from("family_members")
      .select("id,family_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (selfMember) {
      const { data: family } = await supabase
        .from("families")
        .select("id,name,admin_user_id")
        .eq("id", selfMember.family_id)
        .maybeSingle();
      const { data: members } = await supabase
        .from("family_members")
        .select("id,family_id,user_id,name,emoji,stage,toggles")
        .eq("family_id", selfMember.family_id)
        .order("created_at", { ascending: true });
      return {
        role: "member",
        family: family ?? null,
        members: (members ?? []) as ServerFamilyMember[],
        selfMemberId: selfMember.id,
      };
    }

    return { role: "none", family: null, members: [], selfMemberId: null };
  });

const upsertMemberSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().min(1).max(8),
  stage: stageSchema,
  toggles: togglesSchema,
  familyName: z.string().trim().min(1).max(40).optional(),
});

export const upsertFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertMemberSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Ensure family exists (admin = caller)
    let { data: family } = await supabase
      .from("families")
      .select("id")
      .eq("admin_user_id", userId)
      .maybeSingle();

    if (!family) {
      const { data: created, error: famErr } = await supabase
        .from("families")
        .insert({ admin_user_id: userId, name: data.familyName ?? "Meine Familie" })
        .select("id")
        .single();
      if (famErr) throw new Error(famErr.message);
      family = created;
    }

    if (data.id) {
      const { error } = await supabase
        .from("family_members")
        .update({
          name: data.name,
          emoji: data.emoji,
          stage: data.stage,
          toggles: data.toggles ?? {},
        })
        .eq("id", data.id)
        .eq("family_id", family.id);
      if (error) throw new Error(error.message);
      return { id: data.id, familyId: family.id };
    }

    const { data: row, error } = await supabase
      .from("family_members")
      .insert({
        family_id: family.id,
        name: data.name,
        emoji: data.emoji,
        stage: data.stage,
        toggles: data.toggles ?? {},
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string, familyId: family.id };
  });

export const removeFamilyMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("family_members").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameFamily = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().trim().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("families")
      .update({ name: data.name })
      .eq("admin_user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createPinInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ memberId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .rpc("create_pin_invite", { _member_id: data.memberId })
      .single<{ pin: string; expires_at: string }>();
    if (error) throw new Error(error.message);
    return { pin: row!.pin, expiresAt: row!.expires_at };
  });

export const claimPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ pin: z.string().regex(/^\d{6}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .rpc("claim_pin", { _pin: data.pin })
      .single<{ member_id: string; family_id: string; name: string }>();
    if (error) throw new Error(error.message);
    return { memberId: row!.member_id, familyId: row!.family_id, name: row!.name };
  });
