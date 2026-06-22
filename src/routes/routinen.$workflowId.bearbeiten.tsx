import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { WorkflowEditor } from "@/components/WorkflowEditor";
import { getUserWorkflow } from "@/lib/user-workflows.functions";

export const Route = createFileRoute("/routinen/$workflowId/bearbeiten")({
  component: BearbeitenRoute,
});

function BearbeitenRoute() {
  const { workflowId } = Route.useParams();
  const navigate = useNavigate();
  const fetchOne = useServerFn(getUserWorkflow);

  const { data, isLoading } = useQuery({
    queryKey: ["user-workflow", workflowId],
    queryFn: () => fetchOne({ data: { id: workflowId } }),
  });

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Lädt …</div>;
  if (!data)
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Routine nicht gefunden.</p>
      </div>
    );

  return (
    <WorkflowEditor
      title="Routine bearbeiten"
      initial={{
        id: data.id,
        name: data.name,
        category: data.category,
        icon: data.icon ?? "",
        steps: data.steps,
      }}
      onSaved={() => navigate({ to: "/routinen" })}
      onCancel={() => navigate({ to: "/routinen/$workflowId", params: { workflowId } })}
    />
  );
}
