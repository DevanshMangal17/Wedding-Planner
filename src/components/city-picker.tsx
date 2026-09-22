"use client";

import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { INDIAN_CITIES, INDIAN_STATES } from "@/lib/indianCities";

interface CityOption {
  value: string;
  label: string;
}

const ALL_STATES = "__all__";

export function CityPicker({ value, onChange }: { value: string; onChange: (city: string) => void }) {
  const [state, setState] = useState<string>(ALL_STATES);

  const options: CityOption[] = useMemo(() => {
    const cities = state === ALL_STATES ? INDIAN_CITIES : INDIAN_CITIES.filter((c) => c.state === state);
    return cities.map((c) => ({ value: c.name, label: `${c.name}, ${c.state}` }));
  }, [state]);

  const selected = options.find((o) => o.value === value) ?? (value ? { value, label: value } : null);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select
        value={state}
        onValueChange={(v) => {
          setState(v as string);
          // if the current city isn't in the newly chosen state, clear it so
          // the two controls never silently disagree with each other
          const next = v === ALL_STATES ? INDIAN_CITIES : INDIAN_CITIES.filter((c) => c.state === v);
          if (value && !next.some((c) => c.name === value)) onChange("");
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="State (optional)">{(v: string) => (v === ALL_STATES ? "All states" : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATES}>All states</SelectItem>
          {INDIAN_STATES.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Combobox<CityOption>
        items={options}
        value={selected}
        onValueChange={(item) => onChange(item?.value ?? "")}
      >
        <ComboboxInput placeholder="Search city..." showClear />
        <ComboboxContent>
          <ComboboxEmpty>No city found — try a different search or state.</ComboboxEmpty>
          <ComboboxList>
            {(item: CityOption) => (
              <ComboboxItem key={item.value} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
