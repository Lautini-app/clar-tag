import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import {
  KEYS,
  lsGet,
  lsSet,
  effectiveToggles,
  memberStage,
  STAGE_DEFAULTS,
  type FamilyMember,
  type MemberToggles,
  type Stage,
} from "@/lib/storage";
import {
  getFamilyContext,
  upsertFamilyMember,
  removeFamilyMember,
  type FamilyContext,
} from "@/lib/family.functions";

const EMPTY_MEMBERS: FamilyMember[] = [];

function toClientMember(m: FamilyContext["members"][number]): FamilyMember {
  return {
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    stage: m.stage as Stage,
    toggles: (m.toggles ?? {}) as Partial<MemberToggles>,
  };
}

export function useFamily() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchCtx = useServerFn(getFamilyContext);
  const upsertFn = useServerFn(upsertFamilyMember);
  const removeFn = useServerFn(removeFamilyMember);

  const ctxQuery = useQuery({
    queryKey: ["family-context", user?.id ?? "anon"],
    queryFn: () => fetchCtx(),
    enabled: !!user,
    staleTime: 30_000,
  });

  const ctx = ctxQuery.data;
  const members: FamilyMember[] = useMemo(
    () => (ctx?.members ?? []).map(toClientMember),
    [ctx],
  );
  const role = ctx?.role === "none" && user ? "admin" : (ctx?.role ?? "none");
  const family = ctx?.family ?? null;
  const selfMemberId = ctx?.selfMemberId ?? null;

  // activeId: members force their own; admins read from localStorage
  const [adminActive, setAdminActive] = useState<string | null>(() =>
    lsGet<string | null>(KEYS.activeMember, null),
  );

  const activeId = role === "member" ? selfMemberId : adminActive;

  useEffect(() => {
    if (role !== "admin") return;
    if (adminActive && !members.find((m) => m.id === adminActive)) {
      setAdminActive(null);
      lsSet(KEYS.activeMember, null);
    }
  }, [adminActive, members, role]);

  const setActive = useCallback(
    (id: string | null) => {
      if (role !== "admin") return;
      setAdminActive(id);
      lsSet(KEYS.activeMember, id);
    },
    [role],
  );

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["family-context"] });
  }, [queryClient]);

  const upsertMember = useCallback(
    async (m: FamilyMember & { familyName?: string }) => {
      await upsertFn({
        data: {
          id: m.id && m.id.length === 36 ? m.id : undefined,
          name: m.name,
          emoji: m.emoji,
          stage: (m.stage ?? "selbststaendig") as Stage,
          toggles: (m.toggles ?? {}) as Record<string, boolean>,
          familyName: m.familyName,
        },
      });
      invalidate();
    },
    [upsertFn, invalidate],
  );

  const removeMember = useCallback(
    async (id: string) => {
      await removeFn({ data: { id } });
      invalidate();
    },
    [removeFn, invalidate],
  );

  const activeMember = activeId ? members.find((m) => m.id === activeId) ?? null : null;
  // Admin sees admin view unless they switched into a member.
  // Member always sees member view (their own).
  const isAdminView = role === "admin" && activeMember === null;
  const toggles = activeMember ? effectiveToggles(activeMember) : null;
  const stage: Stage | null = activeMember ? memberStage(activeMember) : null;

  return {
    members: members.length ? members : EMPTY_MEMBERS,
    activeId,
    activeMember,
    isAdminView,
    toggles,
    stage,
    role,
    family,
    selfMemberId,
    loading: ctxQuery.isLoading,
    setActive,
    upsertMember,
    removeMember,
    refresh: invalidate,
  };
}

export { STAGE_DEFAULTS };
export type { MemberToggles, Stage };
