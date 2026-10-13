"use client";

import { Popover } from "@base-ui/react/popover";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import copy from "@/i18n/es.json";

type HelpKind = keyof typeof copy.eda.help;

// Hover on desktop, click/tap and keyboard on all devices, using one accessible popup.
export function ChartHelp({ kind }: { kind: HelpKind }) {
  const text = copy.eda;
  const help = text.help[kind];
  return <Popover.Root>
    <Popover.Trigger openOnHover delay={200} render={<Button variant="ghost" size="icon" />}
      aria-label={text.why}><Info /></Popover.Trigger>
    <Popover.Portal>
      <Popover.Positioner side="bottom" align="end" sideOffset={8}>
        <Popover.Popup className="chart-help">
          <div className="chart-help-heading"><Popover.Title>{text.why}</Popover.Title>
            <Popover.Close render={<Button variant="ghost" size="icon-sm" />} aria-label={text.close}><X /></Popover.Close>
          </div>
          <Popover.Description render={<div />}>
            <p><span>{text.method}</span>{help.method}</p>
            <p><span>{text.guideline}</span>{help.guideline}</p>
            <small>{text.basis}</small>
          </Popover.Description>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>;
}
