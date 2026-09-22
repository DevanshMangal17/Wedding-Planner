"use client";

import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLogisticsStatusAction } from "@/server/actions/logistics";
import { LOGISTICS_STATUS_LABELS, LOGISTICS_STATUS_ORDER } from "@/lib/labels";
import type { LogisticsStatus } from "@prisma/client";

export function LogisticsStatusSelect({ itemId, status }: { itemId: string; status: LogisticsStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      onValueChange={(value) =>
        startTransition(async () => {
          await updateLogisticsStatusAction(itemId, value as string);
        })
      }
    >
      <SelectTrigger size="sm" className="w-[140px]" disabled={pending}>
        <SelectValue>{(v: LogisticsStatus) => LOGISTICS_STATUS_LABELS[v]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LOGISTICS_STATUS_ORDER.map((s) => (
          <SelectItem key={s} value={s}>
            {LOGISTICS_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
