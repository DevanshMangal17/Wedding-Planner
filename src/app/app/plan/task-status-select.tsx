"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateTaskStatusAction } from "@/server/actions/tasks";
import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from "@/lib/labels";
import type { TaskStatus } from "@prisma/client";

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      onValueChange={(value) =>
        startTransition(async () => {
          await updateTaskStatusAction(taskId, value as string);
        })
      }
    >
      <SelectTrigger size="sm" className="w-[150px]" disabled={pending}>
        <SelectValue>{(v: TaskStatus) => TASK_STATUS_LABELS[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
