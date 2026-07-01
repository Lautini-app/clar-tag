// Resolve a workflow id (built-in slug or DB uuid) into a runnable Workflow shape.
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getWorkflow, type Workflow } from "@/lib/workflows";
import { getUserWorkflow } from "@/lib/user-workflows.functions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(id: string) {
  return UUID_RE.test(id);
}

export function useResolvedWorkflow(id: string): {
  workflow: Workflow | null;
  isUser: boolean;
  isLoading: boolean;
} {
  const fetchOne = useServerFn(getUserWorkflow);
  const looksLikeUser = isUuid(id);
  const builtIn = !looksLikeUser ? getWorkflow(id) : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["user-workflow", id],
    queryFn: () => fetchOne({ data: { id } }),
    enabled: looksLikeUser,
  });

  if (builtIn) {
    return { workflow: builtIn, isUser: false, isLoading: false };
  }
  if (!looksLikeUser) {
    return { workflow: null, isUser: false, isLoading: false };
  }
  if (isLoading || !data) {
    return { workflow: null, isUser: true, isLoading };
  }
  const normSteps = data.steps.map((s) => ({
    emoji: s.emoji,
    text: s.text,
    hint: s.hint ?? undefined,
    duration: s.duration,
  }));
  const wf: Workflow = {
    id: data.id,
    name: data.name,
    icon: data.icon || "✏️",
    category: data.category,
    steps: { grob: normSteps, mittel: normSteps, fein: normSteps },
    material: data.material?.length ? data.material : undefined,
    adhsTips: data.adhs_tips ?? undefined,
  };
  return { workflow: wf, isUser: true, isLoading: false };
}
