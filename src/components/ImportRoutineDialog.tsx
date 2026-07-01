import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  parseImportFile,
  pickImportSteps,
  type RoutineExport,
} from "@/lib/routine-export";
import { importRoutineJson } from "@/lib/routine-import.functions";

type Preview = {
  export: RoutineExport;
  usedGrade: "grob" | "mittel" | "fein";
  stepCount: number;
};

export function ImportRoutineButton() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const doImport = useServerFn(importRoutineJson);

  const mutation = useMutation({
    mutationFn: (data: RoutineExport) => doImport({ data }),
    onSuccess: ({ id, name }) => {
      qc.invalidateQueries({ queryKey: ["user-workflows"] });
      toast.success(`„${name}" importiert`);
      setOpen(false);
      setPreview(null);
      navigate({ to: "/routinen/$workflowId", params: { workflowId: id } });
    },
    onError: (err: Error) => {
      toast.error(`Import fehlgeschlagen: ${err.message}`);
    },
  });

  async function handleFile(file: File) {
    const result = await parseImportFile(file);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const picked = pickImportSteps(result.data.workflow);
    setPreview({
      export: result.data,
      usedGrade: picked.grade,
      stepCount: picked.steps.length,
    });
  }

  function resetAndClose() {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setPreview(null);
      }}
    >
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground">
          <Upload className="h-4 w-4" /> Importieren
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Routine importieren</DialogTitle>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Wähle eine JSON-Datei, die du zuvor exportiert hast. Nur clar·tag
              Routinen-Exporte werden akzeptiert.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="block w-full text-sm text-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <p className="text-[11px] text-muted-foreground">Max. 500 KB.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-[var(--radius-lg)] bg-card p-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{preview.export.workflow.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {preview.export.workflow.name}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                      {preview.export.workflow.category}
                    </span>
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-primary-deep">
                      Grad: {preview.usedGrade}
                    </span>
                    <span className="text-muted-foreground/70">
                      {preview.stepCount} Schritte
                    </span>
                  </div>
                  {preview.export.workflow.material.length > 0 && (
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Material: {preview.export.workflow.material.length} Positionen
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Beim Import wird eine neue eigene Routine angelegt.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {preview ? (
            <>
              <Button variant="ghost" onClick={resetAndClose} disabled={mutation.isPending}>
                Abbrechen
              </Button>
              <Button
                onClick={() => mutation.mutate(preview.export)}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Importieren
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={resetAndClose}>
              Abbrechen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
