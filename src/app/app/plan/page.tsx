import { requireWedding } from "@/lib/session";
import { db } from "@/lib/db";
import { PHASE_LABELS, PHASE_ORDER, PRIORITY_LABELS, TASK_STATUS_LABELS, taskStatusTone, formatDate } from "@/lib/labels";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { TaskStatusSelect } from "./task-status-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function PlanPage() {
  const { wedding } = await requireWedding();
  const tasks = await db.weddingTask.findMany({
    where: { weddingId: wedding.id },
    orderBy: [{ dueDate: "asc" }],
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;

  const byPhase = PHASE_ORDER.map((phase) => ({
    phase,
    tasks: tasks.filter((t) => t.phase === phase),
  })).filter((g) => g.tasks.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Your wedding checklist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {completed} of {total} things done · organised by how far out you are from the wedding.
        </p>
      </div>

      <div className="space-y-6">
        {byPhase.map(({ phase, tasks: phaseTasks }) => (
          <Card key={phase}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-medium">
                <span>{PHASE_LABELS[phase]}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {phaseTasks.filter((t) => t.status === "COMPLETED").length}/{phaseTasks.length} done
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {phaseTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          task.status === "COMPLETED" && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </span>
                      {(task.priority === "CRITICAL" || task.priority === "HIGH") && task.status !== "COMPLETED" && (
                        <StatusBadge label={PRIORITY_LABELS[task.priority]} tone="danger" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{task.category}</span>
                      <span>Due {formatDate(task.dueDate)}</span>
                      <span>Owner: {task.owner}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge label={TASK_STATUS_LABELS[task.status]} tone={taskStatusTone(task.status)} />
                    <TaskStatusSelect taskId={task.id} status={task.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
