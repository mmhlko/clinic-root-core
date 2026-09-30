"use client";

import { useState } from "react";
import { Switch } from "../ui/switch";
import { Spinner } from "../ui/spinner";

interface ActiveSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => Promise<void> | void;
  disabled?: boolean;
  label?: string;
}

export function ActiveSwitch({
  checked,
  onChange,
  disabled = false,
  label = "Активен",
}: ActiveSwitchProps) {
  const [pending, setPending] = useState(false);

  const handleChange = async (nextChecked: boolean) => {
    if (pending || disabled) return;
    setPending(true);
    try {
      await onChange(nextChecked);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={(value) => void handleChange(value)}
        disabled={disabled || pending}
        aria-label={label}
      />
      <span className="text-sm text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
