"use client";

import { useState } from "react";
import { Pagination, SegmentedControl, Switch } from "@/components/ui";

// Pagination prend `hrefFor` (server-friendly) plutôt qu'un callback.
// Pour la démo on rend un href anchor # qui ne navigue pas.

// Demos interactives extraites dans un fichier client, les composants
// qui exposent des callbacks (onValueChange, onCheckedChange, etc.) ne
// peuvent pas recevoir de fonctions depuis un Server Component.

export function SegmentedControlDemo() {
  const [value, setValue] = useState("7d");
  return (
    <SegmentedControl
      value={value}
      onValueChange={setValue}
      options={[
        { value: "7d", label: "7 jours" },
        { value: "30d", label: "30 jours" },
        { value: "90d", label: "90 jours" },
      ]}
    />
  );
}

export function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-4">
      <Switch checked={on} onCheckedChange={setOn} />
      <span className="text-sm text-[color:var(--color-ink-soft)]">
        Switch interactif, clique pour toggler ({on ? "on" : "off"})
      </span>
    </div>
  );
}

export function PaginationDemo() {
  return <Pagination currentPage={3} totalPages={10} hrefFor={() => "#"} />;
}
